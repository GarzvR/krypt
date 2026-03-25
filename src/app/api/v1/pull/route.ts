import {
  getApiKeyContextByToken,
  getUniversalSecrets,
  parseBearerToken,
  serializeSecrets,
  touchApiKeyLastUsed,
} from "@/lib/api-keys";
import { validatePAT } from "@/lib/auth/pat";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const token = parseBearerToken(req.headers.get("authorization"));

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or invalid token" },
        { status: 401 },
      );
    }

    let authContext: {
      userId: string;
      userEmail: string;
      projectId: string;
      projectName: string;
      projectSlug: string;
      environmentId: string;
      environmentName: string;
      secrets: Array<{ key: string; value: string; description: string | null }>;
      apiKeyId?: string;
    } | null = null;

    // Try API Key first (legacy/scoped)
    const apiKey = await getApiKeyContextByToken(token);
    if (apiKey) {
      authContext = {
        userId: apiKey.user.id,
        userEmail: apiKey.user.email,
        projectId: apiKey.environment.project.id,
        projectName: apiKey.environment.project.name,
        projectSlug: apiKey.environment.project.slug,
        environmentId: apiKey.environment.id,
        environmentName: apiKey.environment.name,
        secrets: apiKey.environment.secrets,
        apiKeyId: apiKey.id,
      };
    } else {
      // Try Personal Access Token
      const pat = await validatePAT(token);
      if (pat) {
        const projectId = req.nextUrl.searchParams.get("projectId");
        const envId = req.nextUrl.searchParams.get("envId");

        if (!projectId || !envId) {
          return NextResponse.json(
            { error: "projectId and envId are required when using a PAT" },
            { status: 400 },
          );
        }

        const environment = await prisma.environment.findFirst({
          where: {
            id: envId,
            projectId: projectId,
            project: { ownerId: pat.userId },
          },
          include: {
            project: true,
            secrets: {
              select: {
                key: true,
                value: true,
                description: true,
                createdAt: true,
              },
              orderBy: { createdAt: "asc" },
            },
          },
        });

        if (!environment) {
          return NextResponse.json(
            { error: "Environment not found or unauthorized access" },
            { status: 404 },
          );
        }

        authContext = {
          userId: pat.userId,
          userEmail: pat.user.email,
          projectId: environment.project.id,
          projectName: environment.project.name,
          projectSlug: environment.project.slug,
          environmentId: environment.id,
          environmentName: environment.name,
          secrets: environment.secrets,
        };
      }
    }

    if (!authContext) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 },
      );
    }

    // Optional validations for scoped tokens
    const queryEnvName = req.nextUrl.searchParams.get("envName");
    if (
      queryEnvName &&
      queryEnvName.toLowerCase() !== authContext.environmentName.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "Unauthorized: Environment mismatch" },
        { status: 403 },
      );
    }

    const universalEnv = await getUniversalSecrets(authContext.projectId);
    if (authContext.apiKeyId) {
      await touchApiKeyLastUsed(authContext.apiKeyId);
    }

    const universalVars = universalEnv
      ? serializeSecrets(universalEnv.secrets, universalEnv.id)
      : {};
    const targetVars = serializeSecrets(
      authContext.secrets,
      authContext.environmentId,
    );
    const envVars = { ...universalVars, ...targetVars };

    logAudit({
      action: "SECRETS_PULLED",
      actor: `User: ${authContext.userEmail} (via ${authContext.apiKeyId ? "ApiKey" : "PAT"})`,
      targetType: "Environment",
      targetName: authContext.environmentName,
      projectId: authContext.projectId,
      metadata: {
        secretCount: Object.keys(envVars).length,
        hasUniversal: !!universalEnv,
        mergedCount: Object.keys(universalVars).length,
      },
    });

    return NextResponse.json({
      project: authContext.projectName,
      projectSlug: authContext.projectSlug,
      environment: authContext.environmentName,
      environmentId: authContext.environmentId,
      secrets: envVars,
    });
  } catch (error) {
    console.error("API Pull Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
