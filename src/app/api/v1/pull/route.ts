import { prisma } from "@/lib/prisma";
import { decryptSecretValue } from "@/lib/security/secrets";
import { logAudit } from "@/lib/audit";
import { NextRequest, NextResponse } from "next/server";

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
    
    // Find the API key in the database
    const apiKey = await prisma.apiKey.findUnique({
      where: { key: token },
      include: {
        environment: {
          include: {
            secrets: true,
            project: true,
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

    // Update the lastUsedAt timestamp asynchronously
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    // Format secrets as key-value pairs
    const envVars = apiKey.environment.secrets.reduce((acc, secret) => {
      try {
        acc[secret.key] = decryptSecretValue(secret.value, secret.environmentId);
      } catch (err) {
        // Fallback or log if decryption fails
        console.error(`Failed to decrypt secret ${secret.key}`, err);
        acc[secret.key] = secret.value;
      }
      return acc;
    }, {} as Record<string, string>);

    logAudit({
      action: "SECRETS_PULLED",
      actor: `API Key: ${apiKey.name}`,
      targetType: "Environment",
      targetName: apiKey.environment.name,
      projectId: apiKey.environment.project.id,
      metadata: { secretCount: Object.keys(envVars).length },
    });

    return NextResponse.json({
      project: apiKey.environment.project.name,
      environment: apiKey.environment.name,
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
