import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  formatPlanLimit,
  getCurrentPlan,
  getRecommendedPlan,
  getSecretUsage,
} from "@/lib/plans";

export default async function SettingsPage() {
  const sessionUserId = getSessionUserId();

  if (!sessionUserId) {
    redirect("/sign-in");
  }

  const [user, projectCount, environmentCount, secretCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionUserId },
      select: { planId: true },
    }),
    prisma.project.count({
      where: { ownerId: sessionUserId },
    }),
    prisma.environment.count({
      where: { project: { ownerId: sessionUserId } },
    }),
    prisma.secret.count({
      where: { environment: { project: { ownerId: sessionUserId } } },
    }),
  ]);

  const plan = getCurrentPlan(user?.planId);
  const recommendedPlan = getRecommendedPlan({
    projectCount,
    environmentCount,
    secretCount,
  });
  const usagePercent = getSecretUsage(secretCount, plan.secretLimit);

  const settingCards = [
    {
      title: "Billing",
      value: plan.name,
      detail: "Pro upgrades will run through Lemon Squeezy",
    },
    {
      title: "Security",
      value: "Active",
      detail: "Encryption and audit logs are live",
    },
    {
      title: "Access",
      value: "Private",
      detail: `${projectCount} projects and ${environmentCount} environments`,
    },
  ];

  return (
    <section className="space-y-8">
      <div className="grid gap-0 border border-app md:grid-cols-3">
        {settingCards.map((card, index) => (
          <article
            key={card.title}
            className={`bg-white/[0.03] px-5 py-5 ${
              index < settingCards.length - 1
                ? "border-b border-app md:border-b-0 md:border-r"
                : ""
            }`}
          >
            <p className="text-sm text-app-muted">{card.title}</p>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-app-foreground">
              {card.value}
            </p>
            <p className="mt-2 text-sm text-app-muted">{card.detail}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="border border-app bg-white/[0.03]">
          <div className="flex items-center justify-between border-b border-app px-5 py-4">
            <p className="text-base font-semibold text-app-foreground">
              Workspace limits
            </p>
            <Link
              href="/api/billing/checkout"
              className="inline-flex h-10 items-center border border-app bg-app-primary px-4 text-sm font-semibold text-app-primary-foreground hover:opacity-90"
            >
              Upgrade to Pro
            </Link>
          </div>
          <div className="divide-y divide-white/10">
            {[
              ["Current tier", plan.name],
              ["Projects", `${projectCount} / ${formatPlanLimit(plan.projectLimit)}`],
              [
                "Environments",
                `${environmentCount} / ${formatPlanLimit(plan.environmentLimit)}`,
              ],
              ["Secrets stored", `${secretCount} / ${formatPlanLimit(plan.secretLimit)}`],
              ["Usage load", `${usagePercent}%`],
              ["Recommended tier", recommendedPlan.name],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <span className="text-sm text-app-muted">{label}</span>
                <span className="text-sm font-medium text-app-foreground">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-app bg-white/[0.03]">
          <div className="border-b border-app px-5 py-4">
            <p className="text-base font-semibold text-app-foreground">
              Security features
            </p>
          </div>
          <div className="divide-y divide-white/10">
            {[
              "Encrypt secret values before persistent storage",
              "Audit logs for every create, update, and delete action",
              "CLI pull endpoint with encrypted token exchange",
              "Starter and Pro limit model for workspace growth",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 px-5 py-4 text-sm text-app-foreground"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
                  ✓
                </span>
                <span>{item}</span>
              </div>
            ))}
            <div className="flex items-center gap-3 px-5 py-4 text-sm text-app-muted">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-app bg-white/5">
                -
              </span>
              <span>Lemon Squeezy billing activation flow</span>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
