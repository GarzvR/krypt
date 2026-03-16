import { prisma } from "@/lib/prisma";
import { decryptSecretValue } from "@/lib/security/secrets";

export async function getApiKeyContextByToken(token: string) {
  return prisma.apiKey.findUnique({
    where: { key: token },
    select: {
      id: true,
      key: true,
      user: {
        select: {
          id: true,
          email: true,
        },
      },
      environment: {
        select: {
          id: true,
          name: true,
          projectId: true,
          project: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          secrets: {
            select: {
              key: true,
              value: true,
              description: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      },
    },
  });
}

export async function getUniversalSecrets(projectId: string) {
  return prisma.environment.findFirst({
    where: {
      projectId,
      name: "universal",
    },
    select: {
      id: true,
      name: true,
      secrets: {
        select: {
          key: true,
          value: true,
          description: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

export function parseBearerToken(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice("Bearer ".length).trim();
}

export function serializeSecrets(
  secrets: Array<{ key: string; value: string }>,
  environmentId: string,
) {
  return secrets.reduce(
    (accumulator, secret) => {
      try {
        accumulator[secret.key] = decryptSecretValue(secret.value, environmentId);
      } catch (error) {
        console.error(`Failed to decrypt secret ${secret.key}`, error);
        accumulator[secret.key] = secret.value;
      }

      return accumulator;
    },
    {} as Record<string, string>,
  );
}

export async function touchApiKeyLastUsed(id: string) {
  await prisma.apiKey.update({
    where: { id },
    data: { lastUsedAt: new Date() },
  });
}
