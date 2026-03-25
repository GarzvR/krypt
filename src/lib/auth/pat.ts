import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export function generatePAT() {
  return `krypt_pat_${randomBytes(24).toString("hex")}`;
}

export async function createPAT(userId: string, name?: string) {
  const token = generatePAT();
  return prisma.personalAccessToken.create({
    data: {
      token,
      userId,
      name: name ?? "CLI Token",
    },
  });
}

export async function validatePAT(token: string) {
  const pat = await prisma.personalAccessToken.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });

  if (pat) {
    await prisma.personalAccessToken.update({
      where: { id: pat.id },
      data: { lastUsedAt: new Date() },
    });
  }

  return pat;
}
