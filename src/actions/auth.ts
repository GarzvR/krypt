"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { issueAndSendEmailVerification } from "@/lib/auth/email-verification";
import { prisma } from "@/lib/prisma";
import { parseCredentials } from "@/lib/validations/auth";
import { isRedirectError } from "next/dist/client/components/redirect";

function withError(
  path: "/sign-in" | "/sign-up",
  message: string,
  redirectTo?: string,
) {
  const params = new URLSearchParams({ error: message });

  if (
    redirectTo &&
    redirectTo.startsWith("/") &&
    !redirectTo.startsWith("//")
  ) {
    params.set("redirectTo", redirectTo);
  }

  return `${path}?${params.toString()}`;
}

function withNotice(
  path: "/sign-in" | "/sign-up",
  message: string,
  options?: { email?: string; redirectTo?: string },
) {
  const params = new URLSearchParams({ notice: message });

  if (options?.email) {
    params.set("email", options.email);
  }

  if (
    options?.redirectTo &&
    options.redirectTo.startsWith("/") &&
    !options.redirectTo.startsWith("//")
  ) {
    params.set("redirectTo", options.redirectTo);
  }

  return `${path}?${params.toString()}`;
}

const emailOnlySchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").toLowerCase(),
});

function parseEmailOnly(formData: FormData) {
  return emailOnlySchema.safeParse({
    email: formData.get("email"),
  });
}

function resolveRedirectTarget(formData: FormData) {
  const redirectTo = formData.get("redirectTo");

  if (typeof redirectTo !== "string" || redirectTo.length === 0) {
    return "/dashboard";
  }

  if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return "/dashboard";
  }

  return redirectTo;
}

export async function signUpAction(formData: FormData) {
  const parsed = parseCredentials(formData);

  if (!parsed.success) {
    const error = parsed.error.issues[0]?.message ?? "Invalid credentials.";
    redirect(withError("/sign-up", error));
  }

  const { email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, emailVerifiedAt: true },
  });

  if (existingUser) {
    if (!existingUser.emailVerifiedAt) {
      try {
        const wasAutoVerified = await issueAndSendEmailVerification(existingUser.id, email);
        
        if (wasAutoVerified) {
          redirect(
            withNotice(
              "/sign-in",
              "Sandbox Mode: Account automatically verified. You can now sign in.",
              { email },
            ),
          );
        }
      } catch (error) {
        if (isRedirectError(error)) throw error;
        console.error("Resend verification on sign up error:", error);
        
        const message = error instanceof Error ? error.message : "Email delivery failed.";
        redirect(
          withError(
            "/sign-in",
            `We could not send the verification email: ${message} (Check Resend domain verification)`,
          ) + `&email=${encodeURIComponent(email)}`,
        );
      }

      redirect(
        withNotice(
          "/sign-in",
          "This email is already registered but not verified yet. We sent a fresh verification link.",
          { email },
        ),
      );
    }

    redirect(
      withError("/sign-up", "An account with this email already exists."),
    );
  }

  try {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword(password),
      },
      select: { id: true, email: true },
    });

    const wasAutoVerified = await issueAndSendEmailVerification(user.id, user.email);

    if (wasAutoVerified) {
      redirect(
        withNotice(
          "/sign-in",
          "Sandbox Mode: Account automatically verified. You can now sign in.",
          { email },
        ),
      );
    }
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Sign up error:", error);
    
    const message = error instanceof Error && error.message.includes("Verification") 
      ? `Email error: ${error.message}`
      : "An unexpected error occurred during sign up. Please try again.";

    redirect(
      withError(
        "/sign-up",
        message,
      ),
    );
  }

  redirect(
    withNotice(
      "/sign-in",
      "Check your email and open the verification link before signing in.",
      { email },
    ),
  );
}

export async function signInAction(formData: FormData) {
  const parsed = parseCredentials(formData);
  const redirectTarget = resolveRedirectTarget(formData);

  if (!parsed.success) {
    const error = parsed.error.issues[0]?.message ?? "Invalid credentials.";
    redirect(withError("/sign-in", error, redirectTarget));
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true, emailVerifiedAt: true },
    });

    if (!user) {
      redirect(
        withError("/sign-in", "Invalid email or password.", redirectTarget),
      );
    }

    const passwordMatches = await verifyPassword(password, user.passwordHash);

    if (!passwordMatches) {
      redirect(
        withError("/sign-in", "Invalid email or password.", redirectTarget),
      );
    }

    if (!user.emailVerifiedAt) {
      redirect(
        withError(
          "/sign-in",
          "Verify your email first. We only allow sign in for verified accounts.",
          redirectTarget,
        ) + `&email=${encodeURIComponent(email)}`,
      );
    }

    createSession(user.id);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Sign in error:", error);
    redirect(
      withError(
        "/sign-in",
        "An unexpected error occurred during sign in.",
        redirectTarget,
      ),
    );
  }

  redirect(redirectTarget);
}

export async function resendVerificationEmailAction(formData: FormData) {
  const parsed = parseEmailOnly(formData);

  if (!parsed.success) {
    redirect(
      withError(
        "/sign-in",
        parsed.error.issues[0]?.message ?? "Invalid email.",
      ),
    );
  }

  const { email } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, emailVerifiedAt: true },
    });

    if (user && !user.emailVerifiedAt) {
      const wasAutoVerified = await issueAndSendEmailVerification(user.id, email);
      
      if (wasAutoVerified) {
        redirect(
          withNotice(
            "/sign-in",
            "Sandbox Mode: Account automatically verified. You can now sign in.",
            { email },
          ),
        );
      }
    }
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Resend verification email error:", error);
    
    const message = error instanceof Error ? error.message : "Delivery failed.";
    redirect(
      withError(
        "/sign-in",
        `Email delivery failed: ${message}`,
      ) + `&email=${encodeURIComponent(email)}`,
    );
  }

  redirect(
    withNotice(
      "/sign-in",
      "If that email exists and is not verified yet, a verification link has been sent.",
      { email },
    ),
  );
}

export async function signOutAction() {
  destroySession();
  redirect("/sign-in");
}
