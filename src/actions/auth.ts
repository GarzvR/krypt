"use server";

import { redirect } from "next/navigation";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { parseCredentials } from "@/lib/validations/auth";

function withError(path: "/sign-in" | "/sign-up", message: string) {
  const params = new URLSearchParams({ error: message });
  return `${path}?${params.toString()}`;
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
    redirect(withError("/sign-up", "An account with this email already exists."));
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
    },
    select: { id: true },
  });

  createSession(user.id);
  redirect("/dashboard");
}

export async function signInAction(formData: FormData) {
  const parsed = parseCredentials(formData);

  if (!parsed.success) {
    const error = parsed.error.issues[0]?.message ?? "Invalid credentials.";
    redirect(withError("/sign-in", error));
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  if (!user) {
    redirect(withError("/sign-in", "Invalid email or password."));
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);

  if (!passwordMatches) {
    redirect(withError("/sign-in", "Invalid email or password."));
  }

  createSession(user.id);
  redirect("/dashboard");
}

export async function signOutAction() {
  destroySession();
  redirect("/sign-in");
}
