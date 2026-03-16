"use server";

import { redirect } from "next/navigation";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
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
    select: { id: true },
  });

  if (existingUser) {
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
      select: { id: true },
    });

    createSession(user.id);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Sign up error:", error);
    redirect(
      withError(
        "/sign-up",
        "An unexpected error occurred during sign up. Please try again.",
      ),
    );
  }

  redirect("/dashboard");
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
      select: { id: true, passwordHash: true },
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

export async function signOutAction() {
  destroySession();
  redirect("/sign-in");
}
