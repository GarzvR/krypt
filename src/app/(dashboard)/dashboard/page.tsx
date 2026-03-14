import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const REQUIRED_ENVIRONMENTS = ["development", "staging", "production"] as const;

function maskSecretKey(key: string) {
  if (key.length <= 6) {
    return key;
  }

  return `${key.slice(0, 4)}...${key.slice(-2)}`;
}

function formatMissingEnvironments(environmentNames: string[]) {
  const missing = REQUIRED_ENVIRONMENTS.filter(
    (name) => !environmentNames.includes(name),
  );

  if (missing.length === 0) {
    return "All core environments are ready";
  }

  return `Missing ${missing.join(", ")}`;
}

export default async function DashboardPage() {
  const sessionUserId = getSessionUserId();

  if (!sessionUserId) {
    redirect("/sign-in");
  }

  const [projectCount, environmentCount, secretCount, projects, recentSecrets] =
    await Promise.all([
      prisma.project.count({
        where: { ownerId: sessionUserId },
      }),
      prisma.environment.count({
        where: { project: { ownerId: sessionUserId } },
      }),
      prisma.secret.count({
        where: { environment: { project: { ownerId: sessionUserId } } },
      }),
      prisma.project.findMany({
        where: { ownerId: sessionUserId },
        orderBy: { createdAt: "desc" },
        include: {
          environments: {
            orderBy: { createdAt: "asc" },
            include: {
              _count: {
                select: { secrets: true },
              },
            },
          },
        },
      }),
      prisma.secret.findMany({
        where: { environment: { project: { ownerId: sessionUserId } } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          environment: {
            include: {
              project: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),
    ]);

  const stats = [
    { label: "Projects", value: projectCount.toString() },
    {
      label: "Environments",
      value: environmentCount.toString(),
    },
    { label: "Secrets", value: secretCount.toString() },
  ];

  const readyProjects = projects.filter((project) => {
    const names = project.environments.map((environment) => environment.name);
    return REQUIRED_ENVIRONMENTS.every((name) => names.includes(name));
  }).length;

  const emptyEnvironments = projects.reduce((total, project) => {
    return (
      total +
      project.environments.filter(
        (environment) => environment._count.secrets === 0,
      ).length
    );
  }, 0);
  const populatedEnvironments = Math.max(
    environmentCount - emptyEnvironments,
    0,
  );
  const readinessPercent =
    projects.length === 0
      ? 0
      : Math.round((readyProjects / projects.length) * 100);
  const coveragePercent =
    environmentCount === 0
      ? 0
      : Math.round((populatedEnvironments / environmentCount) * 100);

  const mostLoadedProject = [...projects]
    .sort((left, right) => {
      const leftSecrets = left.environments.reduce(
        (total, environment) => total + environment._count.secrets,
        0,
      );
      const rightSecrets = right.environments.reduce(
        (total, environment) => total + environment._count.secrets,
        0,
      );

      return rightSecrets - leftSecrets;
    })
    .at(0);

  return (
    <section className="flex min-h-0 flex-col gap-5 lg:h-full">
      <div className="grid gap-0 border border-app md:grid-cols-3">
        {stats.map((stat, index) => (
          <article
            key={stat.label}
            className={`bg-white/[0.03] px-5 py-5 ${
              index < stats.length - 1
                ? "border-b border-app md:border-b-0 md:border-r"
                : ""
            }`}
          >
            <p className="text-sm text-app-muted">{stat.label}</p>
            <p className="mt-4 text-5xl font-semibold tracking-tight text-app-foreground">
              {stat.value}
            </p>
          </article>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="border border-app bg-white/[0.03]">
          <div className="flex items-center justify-between border-b border-app px-5 py-4">
            <p className="text-base font-semibold text-app-foreground">
              Workspace summary
            </p>
            <Link
              href="/projects"
              className="inline-flex h-10 items-center border border-app bg-app-primary px-4 text-sm font-semibold text-app-primary-foreground hover:opacity-90"
            >
              Open projects
            </Link>
          </div>
          <div className="grid gap-0 sm:grid-cols-2 xl:grid-cols-4">
            <div className="border-b border-app px-5 py-5 sm:border-r xl:border-b-0">
              <p className="text-sm text-app-muted">Project readiness</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-app-foreground">
                {readinessPercent}%
              </p>
              <p className="mt-2 text-sm text-app-muted">
                {readyProjects}/{projects.length || 0} fully staged
              </p>
            </div>
            <div className="border-b border-app px-5 py-5 xl:border-b-0 xl:border-r">
              <p className="text-sm text-app-muted">Environment coverage</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-app-foreground">
                {coveragePercent}%
              </p>
              <p className="mt-2 text-sm text-app-muted">
                {populatedEnvironments}/{environmentCount || 0} with secrets
              </p>
            </div>
            <div className="px-5 py-5 sm:border-r xl:border-r">
              <p className="text-sm text-app-muted">Empty environments</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-app-foreground">
                {emptyEnvironments}
              </p>
              <p className="mt-2 text-sm text-app-muted">Need initialization</p>
            </div>
            <div className="border-t border-app px-5 py-5 sm:border-t-0">
              <p className="text-sm text-app-muted">Largest project</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-app-foreground">
                {mostLoadedProject?.name ?? "None"}
              </p>
              <p className="mt-2 text-sm text-app-muted">
                Highest secret volume
              </p>
            </div>
          </div>
        </section>

        <section className="border border-app bg-white/[0.03]">
          <div className="border-b border-app px-5 py-4">
            <p className="text-base font-semibold text-app-foreground">
              Quick actions
            </p>
          </div>
          <div className="grid gap-3 p-5">
            <Link
              href="/projects"
              className="flex items-center justify-between border border-app px-4 py-4 text-sm text-app-foreground hover:bg-white/[0.04]"
            >
              <span>Create a new project</span>
              <span className="text-app-muted">Start</span>
            </Link>
            <Link
              href="/projects"
              className="flex items-center justify-between border border-app px-4 py-4 text-sm text-app-foreground hover:bg-white/[0.04]"
            >
              <span>Add environment secrets</span>
              <span className="text-app-muted">Open</span>
            </Link>
            <Link
              href="/usage"
              className="flex items-center justify-between border border-app px-4 py-4 text-sm text-app-foreground hover:bg-white/[0.04]"
            >
              <span>Review workspace usage</span>
              <span className="text-app-muted">Open</span>
            </Link>

          </div>
        </section>
      </div>

      <div className="grid min-h-0 flex-1 gap-5 xl:grid-cols-2">
        <section className="flex min-h-0 flex-col border border-app bg-white/[0.03]">
          <div className="flex items-center justify-between border-b border-app px-5 py-4">
            <p className="text-base font-semibold text-app-foreground">
              Project health
            </p>
            <span className="text-sm text-app-muted">
              {projects.length} tracked
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="px-5 py-10 text-sm text-app-muted">
              No projects yet. Start from the Projects page to build your first
              workspace.
            </div>
          ) : (
            <div className="scrollbar-hidden min-h-0 divide-y divide-white/10 overflow-y-auto">
              {projects.slice(0, 4).map((project) => {
                const environmentNames = project.environments.map(
                  (environment) => environment.name,
                );
                const totalSecrets = project.environments.reduce(
                  (total, environment) => total + environment._count.secrets,
                  0,
                );

                return (
                  <div
                    key={project.id}
                    className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto_auto] md:items-center"
                  >
                    <div>
                      <p className="text-base font-semibold text-app-foreground">
                        {project.name}
                      </p>
                      <p className="mt-1 text-sm text-app-muted">
                        {formatMissingEnvironments(environmentNames)}
                      </p>
                    </div>
                    <div className="text-sm text-app-muted">
                      {project.environments.length} envs
                    </div>
                    <div className="text-sm font-medium text-app-foreground">
                      {totalSecrets} secrets
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="flex min-h-0 flex-col border border-app bg-white/[0.03]">
          <div className="flex items-center justify-between border-b border-app px-5 py-4">
            <p className="text-base font-semibold text-app-foreground">
              Recent secret activity
            </p>
            <span className="text-sm text-app-muted">
              {recentSecrets.length} latest
            </span>
          </div>

          {recentSecrets.length === 0 ? (
            <div className="px-5 py-10 text-sm text-app-muted">
              No secret activity yet. Add secrets from the Projects page.
            </div>
          ) : (
            <div className="scrollbar-hidden min-h-0 divide-y divide-white/10 overflow-y-auto">
              {recentSecrets.map((secret) => (
                <div
                  key={secret.id}
                  className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div>
                    <p className="font-mono text-sm font-semibold text-app-foreground">
                      {maskSecretKey(secret.key)}
                    </p>
                    <p className="mt-1 text-sm text-app-muted">
                      {secret.environment.project.name} /{" "}
                      {secret.environment.name}
                    </p>
                  </div>
                  <div className="text-sm text-app-muted">
                    /{secret.environment.project.slug}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
