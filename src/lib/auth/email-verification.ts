import "server-only";

import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email";

const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getAppUrl() {
  return env.APP_URL ?? "http://localhost:3000";
}

function buildVerificationUrl(token: string) {
  const url = new URL("/verify-email", getAppUrl());
  url.searchParams.set("token", token);
  return url.toString();
}

export async function createEmailVerificationToken(userId: string) {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);

  await prisma.emailVerificationToken.deleteMany({
    where: { userId },
  });

  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
    },
  });

  return rawToken;
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = buildVerificationUrl(token);
  const subject = "Verify your Krypt email";
  const text = [
    "Verify your email address to activate your Krypt account.",
    "",
    `Open this link: ${verificationUrl}`,
    "",
    "This link expires in 24 hours.",
  ].join("\n");
  const html = [
    "<p>Verify your email address to activate your Krypt account.</p>",
    `<p><a href="${verificationUrl}">Verify email</a></p>`,
    "<p>This link expires in 24 hours.</p>",
  ].join("");

  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
    if (env.NODE_ENV !== "production") {
      console.info(`Email verification link for ${email}: ${verificationUrl}`);
      return;
    }

    throw new Error("Email delivery is not configured.");
  }

  await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

export async function issueAndSendEmailVerification(userId: string, email: string) {
  if (env.RESEND_FROM_EMAIL === "onboarding@resend.dev") {
    // Sandbox mode restriction: auto-verify the user to allow testing without valid sender domain
    console.warn(`[Sandbox Mode] Auto-verifying email ${email} to bypass Resend sandbox restriction.`);
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: new Date() }
    });
    return true; // Indicates it was auto-verified
  }

  const token = await createEmailVerificationToken(userId);
  await sendVerificationEmail(email, token);
  return false;
}

export async function verifyEmailToken(token: string) {
  const tokenHash = hashToken(token);
  const verification = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, emailVerifiedAt: true } } },
  });

  if (!verification) {
    return { ok: false as const, reason: "invalid" as const };
  }

  if (verification.expiresAt.getTime() < Date.now()) {
    await prisma.emailVerificationToken.delete({
      where: { tokenHash },
    });
    return { ok: false as const, reason: "expired" as const };
  }

  if (!verification.user.emailVerifiedAt) {
    await prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerifiedAt: new Date() },
    });
  }

  await prisma.emailVerificationToken.deleteMany({
    where: { userId: verification.userId },
  });

  return { ok: true as const };
}
