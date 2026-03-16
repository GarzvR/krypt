import {
  getApiKeyContextByToken,
  getUniversalSecrets,
  parseBearerToken,
  serializeSecrets,
  touchApiKeyLastUsed,
} from "@/lib/api-keys";
import { logAudit } from "@/lib/audit";
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

    const envId = req.nextUrl.searchParams.get("envId");
    const envName = req.nextUrl.searchParams.get("envName");
    const projectId = req.nextUrl.searchParams.get("projectId");
    const projectSlug = req.nextUrl.searchParams.get("projectSlug");

    if (!envId && !envName) {
      return NextResponse.json(
        { error: "Missing environment identifier (envId or envName)" },
        { status: 400 },
      );
    }

    const apiKey = await getApiKeyContextByToken(token);

    if (!apiKey) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 },
      );
    }

    const targetEnv = apiKey.environment;

    if (envId && envId !== targetEnv.id) {
      return NextResponse.json(
        {
          error:
            "Unauthorized: This token is only valid for its assigned environment",
        },
        { status: 403 },
      );
    }

    if (envName && envName.toLowerCase() !== targetEnv.name.toLowerCase()) {
      return NextResponse.json(
        {
          error:
            "Unauthorized: This token is only valid for its assigned environment",
        },
        { status: 403 },
      );
    }

    if (projectId && projectId !== targetEnv.projectId) {
      return NextResponse.json(
        { error: "Unauthorized: Project mismatch" },
        { status: 403 },
      );
    }

    if (projectSlug && projectSlug !== targetEnv.project.slug) {
      return NextResponse.json(
        { error: "Unauthorized: Project mismatch" },
        { status: 403 },
      );
    }

    const universalEnv = await getUniversalSecrets(targetEnv.projectId);
    await touchApiKeyLastUsed(apiKey.id);

    const universalVars = universalEnv
      ? serializeSecrets(universalEnv.secrets, universalEnv.id)
      : {};
    const targetVars = serializeSecrets(targetEnv.secrets, targetEnv.id);
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
        mergedCount: Object.keys(universalVars).length,
      },
    });

    return NextResponse.json({
      project: targetEnv.project.name,
      projectSlug: targetEnv.project.slug,
      environment: targetEnv.name,
      environmentId: targetEnv.id,
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
