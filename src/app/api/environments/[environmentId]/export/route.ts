import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getSessionUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { decryptSecretValue } from "@/lib/security/secrets";

type RouteContext = {
  params: {
    environmentId: string;
  };
};

function sanitizeFilenamePart(value: string) {
  return value.replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/-+/g, "-");
}

function formatEnvValue(value: string) {
  if (/^[a-zA-Z0-9_./:-]+$/.test(value)) {
    return value;
  }

  return `"${value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/"/g, '\\"')}"`;
}

export async function GET(_: Request, context: RouteContext) {
  const sessionUserId = getSessionUserId();

  if (!sessionUserId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const environment = await prisma.environment.findFirst({
    where: {
      id: context.params.environmentId,
      project: {
        ownerId: sessionUserId,
      },
    },
    include: {
      project: {
        select: {
          slug: true,
        },
      },
      secrets: {
        orderBy: { key: "asc" },
      },
    },
  });

  if (!environment) {
    return new NextResponse("Environment not found", { status: 404 });
  }

  let dotenvText = "";

  try {
    dotenvText = environment.secrets
      .map(
        (secret) =>
          `${secret.key}=${formatEnvValue(decryptSecretValue(secret.value, context.params.environmentId))}`,
      )
      .join("\n");
  } catch {
    return new NextResponse("Failed to decrypt environment secrets", {
      status: 500,
    });
  }

  const filename = `${sanitizeFilenamePart(environment.project.slug)}-${sanitizeFilenamePart(
    environment.name,
  )}.env`;

  return new NextResponse(dotenvText, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      Pragma: "no-cache",
      Expires: "0",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Cross-Origin-Resource-Policy": "same-origin",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
