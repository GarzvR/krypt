import { LandingPage } from "@/components/landing-page";
import { getSessionUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function LandingRoutePage() {
  const sessionUserId = getSessionUserId();

  const user = sessionUserId
    ? await prisma.user.findUnique({
        where: { id: sessionUserId },
        select: { email: true },
      })
    : null;

  return <LandingPage currentUserEmail={user?.email ?? null} />;
}
