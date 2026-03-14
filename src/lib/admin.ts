import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

/**
 * Checks if the currently logged-in user is an admin.
 * Returns true if the user exists and has role==="admin".
 */
export async function isAdmin(): Promise<boolean> {
  const userId = getSessionUserId();
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === "admin";
}

/**
 * Enforces admin access. Redirects to the dashboard if the user is not an admin.
 * Can be used in server components or server actions.
 */
export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    redirect("/dashboard");
  }
}
