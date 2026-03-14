import { LandingPage } from "@/components/landing-page";
import { getSessionUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const sessionUserId = getSessionUserId();

  const user = sessionUserId
    ? await prisma.user.findUnique({
        where: { id: sessionUserId },
        select: { email: true },
      })
    : null;

  return <LandingPage currentUserEmail={user?.email ?? null} />;
}
