import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

function resolvePlan() {
  return { name: "Free Tier", capacity: 1000, seats: 1 };
}

export default async function SettingsPage() {
  const sessionUserId = getSessionUserId();

  if (!sessionUserId) {
    redirect("/sign-in");
  }

  const [projectCount, environmentCount, secretCount] = await Promise.all([
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

  const plan = resolvePlan();
  const seatsUsed = Math.min(projectCount + 1, plan.seats);
  const usagePercent = Math.min(100, Math.round((secretCount / plan.capacity) * 100));

  const settingCards = [
    {
      title: "Billing",
      value: plan.name,
      detail: `${seatsUsed}/${plan.seats} seats in use`,
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
              index < settingCards.length - 1 ? "border-b border-app md:border-b-0 md:border-r" : ""
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
          <div className="border-b border-app px-5 py-4">
            <p className="text-base font-semibold text-app-foreground">Workspace limits</p>
          </div>
          <div className="divide-y divide-white/10">
            {[
              ["Current tier", plan.name],
              ["Secrets stored", `${secretCount} / ${plan.capacity}`],
              ["Projects count", `${projectCount} / Unlimited`],
              ["Usage load", `${usagePercent}%`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 px-5 py-4">
                <span className="text-sm text-app-muted">{label}</span>
                <span className="text-sm font-medium text-app-foreground">{value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-app bg-white/[0.03]">
          <div className="border-b border-app px-5 py-4">
            <p className="text-base font-semibold text-app-foreground">Security features</p>
          </div>
          <div className="divide-y divide-white/10">
            {[
              { text: "Encrypt secret values before persistent storage", done: true },
              { text: "Audit logs for every create, update, and delete action", done: true },
              { text: "CLI pull endpoint with encrypted token exchange", done: true },
              { text: "Role-based access controls and workspace invites", done: false },
              { text: "Secret rotation reminders and expiry", done: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4 text-sm text-app-foreground">
                {item.done ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
                    ✓
                  </span>
                ) : (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-app bg-white/5 text-app-muted">
                    -
                  </span>
                )}
                <span className={item.done ? "text-app-foreground" : "text-app-muted"}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
