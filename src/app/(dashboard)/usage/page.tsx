import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth/session";
import {
  getCurrentPlan,
  getRecommendedPlan,
  getSecretUsage,
} from "@/lib/plans";
import { prisma } from "@/lib/prisma";

export default async function UsagePage() {
  const sessionUserId = getSessionUserId();

  if (!sessionUserId) {
    redirect("/sign-in");
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: sessionUserId },
    include: {
      environments: {
        include: {
          secrets: {
            select: { id: true, createdAt: true },
          },
        },
      },
    },
  });

  const projectCount = projects.length;
  const environmentCount = projects.reduce(
    (total, project) => total + project.environments.length,
    0,
  );
  const secretCount = projects.reduce(
    (total, project) =>
      total +
      project.environments.reduce(
        (environmentTotal, environment) =>
          environmentTotal + environment.secrets.length,
        0,
      ),
    0,
  );

  const currentPlan = getCurrentPlan();
  const recommendedPlan = getRecommendedPlan(secretCount);
  const usagePercent = getSecretUsage(secretCount, currentPlan.secretLimit);
  const emptyEnvironments = projects.reduce(
    (total, project) =>
      total +
      project.environments.filter(
        (environment) => environment.secrets.length === 0,
      ).length,
    0,
  );
  const activeEnvironments = Math.max(environmentCount - emptyEnvironments, 0);
  const averageSecretsPerEnvironment =
    environmentCount === 0
      ? 0
      : Math.round((secretCount / environmentCount) * 10) / 10;
  const recentWindow = Date.now() - 1000 * 60 * 60 * 24 * 7;
  const secretsAddedThisWeek = projects.reduce(
    (total, project) =>
      total +
      project.environments.reduce(
        (environmentTotal, environment) =>
          environmentTotal +
          environment.secrets.filter(
            (secret) => secret.createdAt.getTime() >= recentWindow,
          ).length,
        0,
      ),
    0,
  );
  const remainingCapacity = Math.max(currentPlan.secretLimit - secretCount, 0);
  const environmentCoverage =
    environmentCount === 0
      ? 0
      : Math.round((activeEnvironments / environmentCount) * 100);
  const burnState =
    usagePercent >= 85 ? "High" : usagePercent >= 60 ? "Moderate" : "Low";
  const usageNotes = [
    `${remainingCapacity} secret slot${remainingCapacity === 1 ? "" : "s"} remaining on ${currentPlan.name}.`,
    `${emptyEnvironments} environment${emptyEnvironments === 1 ? "" : "s"} still have no secrets.`,
    `${secretsAddedThisWeek} secret${secretsAddedThisWeek === 1 ? "" : "s"} added in the last 7 days.`,
  ];

  return (
    <section className="space-y-8">
      <div className="grid gap-0 border border-app md:grid-cols-3">
        {[
          { label: "Projects", value: projectCount },
          { label: "Environments", value: environmentCount },
          { label: "Encrypted secrets", value: secretCount },
        ].map((item, index, list) => (
          <article
            key={item.label}
            className={`bg-white/[0.03] px-5 py-5 ${
              index < list.length - 1
                ? "border-b border-app md:border-b-0 md:border-r"
                : ""
            }`}
          >
            <p className="text-sm text-app-muted">{item.label}</p>
            <p className="mt-4 text-5xl font-semibold tracking-tight text-app-foreground">
              {item.value}
            </p>
          </article>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="border border-app bg-white/[0.03]">
          <div className="border-b border-app px-5 py-4">
            <p className="text-base font-semibold text-app-foreground">
              Secret limit usage
            </p>
          </div>
          <div className="grid gap-0">
            <div className="px-5 py-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-app-muted">Current plan</p>
                  <p className="mt-3 text-5xl font-semibold tracking-tight text-app-foreground">
                    {usagePercent}%
                  </p>
                </div>
                <p className="text-sm text-app-muted">
                  {secretCount} / {currentPlan.secretLimit}
                </p>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-[#65e0c7]"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="border border-app px-4 py-4">
                  <p className="text-sm text-app-muted">Coverage</p>
                  <p className="mt-2 text-2xl font-semibold text-app-foreground">
                    {environmentCoverage}%
                  </p>
                </div>
                <div className="border border-app px-4 py-4">
                  <p className="text-sm text-app-muted">Avg / env</p>
                  <p className="mt-2 text-2xl font-semibold text-app-foreground">
                    {averageSecretsPerEnvironment}
                  </p>
                </div>
                <div className="border border-app px-4 py-4">
                  <p className="text-sm text-app-muted">Burn state</p>
                  <p className="mt-2 text-2xl font-semibold text-app-foreground">
                    {burnState}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section className="border border-app bg-white/[0.03]">
          <div className="border-b border-app px-5 py-4">
            <p className="text-base font-semibold text-app-foreground">
              Plan metrics
            </p>
          </div>
          <div className="divide-y divide-white/10">
            {[
              ["Current plan", currentPlan.name],
              ["Secret limit", `${currentPlan.secretLimit}`],
              ["Project limit", `${currentPlan.projectLimit}`],
              ["Remaining capacity", `${remainingCapacity}`],
              ["Recommended upgrade", recommendedPlan.name],
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
      </div>

      <section className="border border-app bg-white/[0.03]">
        <div className="border-b border-app px-5 py-4">
          <p className="text-base font-semibold text-app-foreground">
            Operational signals
          </p>
        </div>
        <div className="grid gap-0 md:grid-cols-3">
          {[
            [
              "Active environments",
              `${activeEnvironments}/${environmentCount || 0}`,
            ],
            ["Empty environments", `${emptyEnvironments}`],
            ["Secrets added this week", `${secretsAddedThisWeek}`],
          ].map(([label, value], index, list) => (
            <div
              key={label}
              className={`px-5 py-5 ${
                index < list.length - 1
                  ? "border-b border-app md:border-b-0 md:border-r"
                  : ""
              }`}
            >
              <p className="text-sm text-app-muted">{label}</p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-app-foreground">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
