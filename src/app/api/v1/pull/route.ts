import { prisma } from "@/lib/prisma";
import { decryptSecretValue } from "@/lib/security/secrets";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or invalid token" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const envId = req.nextUrl.searchParams.get("envId");
    const envName = req.nextUrl.searchParams.get("envName");
    const projectId = req.nextUrl.searchParams.get("projectId");
    const projectSlug = req.nextUrl.searchParams.get("projectSlug");

    if (!envId && !envName) {
      return NextResponse.json(
        { error: "Missing environment identifier (envId or envName)" },
        { status: 400 }
      );
    }
    
    // Find the API key and its associated environment
    const apiKey = await prisma.apiKey.findUnique({
      where: { key: token },
      include: {
        user: true,
        environment: {
          include: {
            project: true,
            secrets: true,
          },
        },
      },
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    // The token is now strictly tied to one environment
    let targetEnv = apiKey.environment;

    // If user explicitly requested an environment, verify it matches the token's environment
    if (envId && envId !== targetEnv.id) {
       return NextResponse.json(
        { error: "Unauthorized: This token is only valid for its assigned environment" },
        { status: 403 }
      );
    }

    if (envName && envName.toLowerCase() !== targetEnv.name.toLowerCase()) {
       return NextResponse.json(
        { error: "Unauthorized: This token is only valid for its assigned environment" },
        { status: 403 }
      );
    }

    // Verify project context if provided
    if (projectId && projectId !== targetEnv.projectId) {
       return NextResponse.json(
        { error: "Unauthorized: Project mismatch" },
        { status: 403 }
      );
    }

    if (projectSlug && projectSlug !== targetEnv.project.slug) {
       return NextResponse.json(
        { error: "Unauthorized: Project mismatch" },
        { status: 403 }
      );
    }

    // Identify the project to look for 'universal' env (inherited secrets)
    const currentProjectId = targetEnv.projectId;

    // Fetch universal secrets if they exist
    const universalEnv = await prisma.environment.findFirst({
      where: {
        projectId: currentProjectId,
        name: "universal"
      },
      include: {
        secrets: true
      }
    });

    // Update the lastUsedAt timestamp asynchronously
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    // Helper to decrypt and format secrets
    const formatSecrets = (secrets: any[], environmentId: string) => {
      return secrets.reduce((acc, secret) => {
        try {
          acc[secret.key] = decryptSecretValue(secret.value, environmentId);
        } catch (err) {
          console.error(`Failed to decrypt secret ${secret.key}`, err);
          acc[secret.key] = secret.value;
        }
        return acc;
      }, {} as Record<string, string>);
    };

    // Merge secrets: Universal first, then target (target overrides universal)
    const universalVars = universalEnv ? formatSecrets(universalEnv.secrets, universalEnv.id) : {};
    const targetVars = formatSecrets(targetEnv.secrets, targetEnv.id);
    
    const envVars = { ...universalVars, ...targetVars };

    logAudit({
      action: "SECRETS_PULLED",
      actor: `User: ${apiKey.user.email} (via token)`,
      targetType: "Environment",
      targetName: targetEnv.name,
      projectId: targetEnv.project.id,
      metadata: { 
        secretCount: Object.keys(envVars).length,
        hasUniversal: !!universalEnv,
        mergedCount: Object.keys(universalVars).length
      },
    });

    return NextResponse.json({
      project: targetEnv.project.name,
      environment: targetEnv.name,
      secrets: envVars,
    });


  } catch (error) {
    console.error("API Pull Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
