import { UserCircle } from "@phosphor-icons/react/dist/ssr";
import { signOutAction } from "@/actions/auth";
import { DashboardNav } from "@/components/dashboard-nav";
import { DashboardSearch } from "@/components/dashboard-search";
import { isAdmin } from "@/lib/admin";
import { destroySession, getSessionUserId } from "@/lib/auth/session";
import { getCurrentPlan, getSecretUsage } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUserId = getSessionUserId();

  if (!sessionUserId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUserId },
    select: { email: true },
  });
  const secretCount = await prisma.secret.count({
    where: {
      environment: {
        project: {
          ownerId: sessionUserId,
        },
      },
    },
  });

  if (!user) {
    destroySession();
    redirect("/sign-in");
  }

  const localName = user.email.split("@")[0] ?? "workspace user";
  const userDisplayName =
    localName
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ") || "Workspace User";
  const currentPlan = getCurrentPlan();
  const usagePercent = getSecretUsage(secretCount, currentPlan.secretLimit);
  const admin = await isAdmin();

  return (
    <div className="min-h-screen w-full bg-app">
      <div className="grid min-h-screen lg:h-screen lg:grid-cols-[292px_minmax(0,1fr)]">
        <aside className="border-b border-app bg-[rgba(6,16,29,0.94)] lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col p-5">
            <div className="border-b border-app pb-5">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full text-app-foreground">
                  <UserCircle size={42} weight="fill" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-app-foreground">
                    {userDisplayName}
                  </span>
                  <span className="block truncate text-sm text-app-muted">
                    {user.email}
                  </span>
                </span>
              </div>
            </div>

            <div className="border-b border-app py-4">
              <DashboardSearch />
            </div>

            <div className="py-4">
              <DashboardNav isAdmin={admin} />
            </div>

            <div className="mt-auto border-t border-app pt-5">
              <div className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-app-foreground">
                    Usage limit
                  </p>
                  <span className="text-sm font-semibold text-app-foreground">
                    {usagePercent}%
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-[#65e0c7]"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
                <p className="mt-3 text-xs text-app-muted">
                  {secretCount} / {currentPlan.secretLimit} secrets
                </p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-col px-4 py-4 sm:px-6 lg:h-screen lg:overflow-hidden lg:px-8">
          <div className="flex justify-end">
            <form action={signOutAction}>
              <button
                type="submit"
                className="h-11 border border-app bg-app-primary px-5 text-sm font-semibold text-app-primary-foreground hover:opacity-90"
              >
                Sign out
              </button>
            </form>
          </div>

          <div className="scrollbar-hidden min-h-0 flex-1 overflow-y-auto pt-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
