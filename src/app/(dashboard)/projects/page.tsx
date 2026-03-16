import Link from "next/link";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";
import {
  createApiKey,
  createEnvironment,
  createProject,
  createSecret,
  deleteApiKey,
  deleteEnvironment,
  deleteProject,
  deleteSecret,
} from "@/actions/projects";
import { CopyButton } from "@/components/copy-button";
import { Command } from "@phosphor-icons/react/dist/ssr";
import { getSessionUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const ENVIRONMENT_ORDER = ["development", "production", "staging"] as const;

function maskSecret(value: string) {
  return "*".repeat(Math.min(Math.max(value.length, 6), 16));
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function ProjectsPage() {
  const sessionUserId = getSessionUserId();

  if (!sessionUserId) {
    redirect("/sign-in");
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: sessionUserId },
    orderBy: { createdAt: "desc" },
    include: {
      environments: {
        include: {
          secrets: {
            orderBy: { createdAt: "desc" },
          },
          apiKeys: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  const totals = projects.reduce(
    (accumulator, project) => {
      accumulator.environments += project.environments.length;
      accumulator.secrets += project.environments.reduce(
        (secretTotal, environment) => secretTotal + environment.secrets.length,
        0,
      );
      return accumulator;
    },
    { environments: 0, secrets: 0 },
  );

  return (
    <section className="space-y-8">
      <div className="grid gap-0 border border-app md:grid-cols-3">
        {[
          { label: "Projects", value: projects.length },
          { label: "Environments", value: totals.environments },
          { label: "Secrets", value: totals.secrets },
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
              {String(item.value).padStart(2, "0")}
            </p>
          </article>
        ))}
      </div>

      <section className="border border-app bg-white/[0.03]">
        <div className="flex flex-col gap-4 border-b border-app px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-base font-semibold text-app-foreground">
            Create project
          </p>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center border border-app bg-white/[0.04] px-4 text-sm font-medium text-app-foreground hover:bg-white/[0.08]"
          >
            Back to dashboard
          </Link>
        </div>

        <form
          action={createProject}
          className="grid gap-3 p-5 lg:grid-cols-[minmax(0,1fr)_auto]"
        >
          <input
            type="text"
            name="name"
            required
            placeholder="Project name"
            className="h-12 border border-app bg-transparent px-4 text-sm text-app-foreground outline-none ring-app-primary placeholder:text-app-muted focus:ring-2"
          />
          <button
            type="submit"
            className="h-12 border border-app bg-app-primary px-5 text-sm font-semibold text-app-primary-foreground transition hover:opacity-90"
          >
            Create project
          </button>
        </form>
      </section>

      {projects.length === 0 ? (
        <div className="border border-dashed border-app px-6 py-16 text-center">
          <p className="text-lg font-semibold text-app-foreground">
            No projects yet.
          </p>
          <p className="mt-2 text-sm text-app-muted">
            Create your first project to start managing secrets.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((project, index) => {
            const environmentMap = new Map(
              project.environments.map((environment) => [
                environment.name,
                environment,
              ]),
            );
            const secretCount = project.environments.reduce(
              (accumulator, environment) =>
                accumulator + environment.secrets.length,
              0,
            );

            const sortedEnvironments = [...project.environments].sort(
              (a, b) => {
                const aIndex = ENVIRONMENT_ORDER.indexOf(
                  a.name as (typeof ENVIRONMENT_ORDER)[number],
                );
                const bIndex = ENVIRONMENT_ORDER.indexOf(
                  b.name as (typeof ENVIRONMENT_ORDER)[number],
                );

                return (
                  (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex)
                );
              },
            );

            return (
              <details
                key={project.id}
                className="group border border-app bg-white/[0.03]"
                open={index === 0}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between border-b border-app px-5 py-5 marker:content-[''] [&::-webkit-details-marker]:hidden">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight text-app-foreground">
                        {project.name}
                      </h2>
                      <p className="mt-2 text-sm text-app-muted">
                        /{project.slug}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="border border-app px-4 py-4">
                        <p className="text-sm text-app-muted">Environments</p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight text-app-foreground">
                          {project.environments.length}
                        </p>
                      </div>
                      <div className="border border-app px-4 py-4">
                        <p className="text-sm text-app-muted">Secrets</p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight text-app-foreground">
                          {secretCount}
                        </p>
                      </div>
                      <div className="flex items-center justify-center border border-app px-5 py-4 text-app-foreground">
                        <CaretDown
                          size={22}
                          className="transition-transform duration-200 group-open:rotate-180"
                        />
                      </div>
                    </div>
                  </div>
                </summary>

                <div className="space-y-5 px-5 py-5">
                  <div className="border border-app p-4">
                    <div className="flex flex-wrap gap-2">
                      {ENVIRONMENT_ORDER.map((environmentName) => {
                        const existingEnvironment =
                          environmentMap.get(environmentName);

                        if (existingEnvironment) {
                          return (
                            <span
                              key={environmentName}
                              className="border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold capitalize text-emerald-300"
                            >
                              {environmentName}
                            </span>
                          );
                        }

                        return (
                          <form
                            key={environmentName}
                            action={createEnvironment}
                          >
                            <input
                              type="hidden"
                              name="projectId"
                              value={project.id}
                            />
                            <input
                              type="hidden"
                              name="name"
                              value={environmentName}
                            />
                            <button
                              type="submit"
                              className="border border-app bg-white/[0.04] px-3 py-2 text-xs font-semibold capitalize text-app-foreground hover:bg-white/[0.08]"
                            >
                              Add {environmentName}
                            </button>
                          </form>
                        );
                      })}
                    </div>

                    <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
                      <form action={createEnvironment} className="contents">
                        <input
                          type="hidden"
                          name="projectId"
                          value={project.id}
                        />
                        <input
                          type="text"
                          name="name"
                          required
                          placeholder="Custom environment name"
                          className="h-11 border border-app bg-transparent px-3 text-sm text-app-foreground outline-none ring-app-primary placeholder:text-app-muted focus:ring-2"
                        />
                        <button
                          type="submit"
                          className="h-11 border border-app bg-white/[0.04] px-4 text-sm font-medium text-app-foreground hover:bg-white/[0.08]"
                        >
                          Add environment
                        </button>
                      </form>
                      <form action={deleteProject}>
                        <input
                          type="hidden"
                          name="projectId"
                          value={project.id}
                        />
                        <button
                          type="submit"
                          className="h-11 border border-rose-400/25 bg-rose-400/10 px-4 text-sm font-semibold text-rose-300 hover:bg-rose-400/15"
                        >
                          Delete project
                        </button>
                      </form>
                    </div>
                  </div>

                  {sortedEnvironments.length === 0 ? (
                    <p className="border border-dashed border-app px-4 py-5 text-sm text-app-muted">
                      No environments yet for this project.
                    </p>
                  ) : (
                    sortedEnvironments.map((environment) => (
                      <details
                        key={environment.id}
                        className="group overflow-hidden border border-app bg-black/10"
                        open
                      >
                        <summary className="flex cursor-pointer items-center justify-between border-b border-app bg-white/[0.03] px-5 py-4 transition-colors hover:bg-white/[0.05] marker:content-[''] [&::-webkit-details-marker]:hidden">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex h-8 w-8 items-center justify-center border border-app bg-black/20 text-app-foreground">
                                <CaretDown
                                  size={18}
                                  className="transition-transform duration-200 group-open:rotate-180"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium capitalize text-app-foreground">
                                  {environment.name}
                                </p>
                                <p className="mt-1 text-xs text-app-muted">
                                  {environment.secrets.length} secret
                                  {environment.secrets.length === 1 ? "" : "s"}
                                </p>
                              </div>
                            </div>
                            <div
                              className="flex flex-wrap gap-3 [&>*]:pointer-events-auto"
                              style={{ pointerEvents: "auto" }}
                            >
                              <a
                                href={`/api/environments/${environment.id}/export`}
                                className="inline-flex h-11 items-center justify-center border border-app bg-white/[0.04] px-4 text-sm font-semibold text-app-foreground hover:bg-white/[0.08]"
                              >
                                Export .env
                              </a>
                              <form action={deleteEnvironment}>
                                <input
                                  type="hidden"
                                  name="environmentId"
                                  value={environment.id}
                                />
                                <button
                                  type="submit"
                                  className="h-11 border border-rose-400/25 bg-rose-400/10 px-4 text-sm font-semibold text-rose-300 hover:bg-rose-400/15"
                                >
                                  Delete environment
                                </button>
                              </form>
                            </div>
                          </div>
                        </summary>

                        <div className="p-5">
                          <form
                            action={createSecret}
                            className="grid gap-3 border-b border-app pb-5 xl:grid-cols-[1.2fr_1.2fr_1fr_auto]"
                          >
                            <input
                              type="hidden"
                              name="environmentId"
                              value={environment.id}
                            />
                            <input
                              type="text"
                              name="key"
                              required
                              placeholder="API_KEY"
                              className="h-11 border border-app bg-transparent px-3 text-sm text-app-foreground outline-none ring-app-primary placeholder:text-app-muted focus:ring-2"
                            />
                            <input
                              type="text"
                              name="value"
                              required
                              placeholder="Secret value"
                              className="h-11 border border-app bg-transparent px-3 text-sm text-app-foreground outline-none ring-app-primary placeholder:text-app-muted focus:ring-2"
                            />
                            <input
                              type="text"
                              name="description"
                              placeholder="Description"
                              className="h-11 border border-app bg-transparent px-3 text-sm text-app-foreground outline-none ring-app-primary placeholder:text-app-muted focus:ring-2"
                            />
                            <button
                              type="submit"
                              className="h-11 border border-app bg-app-primary px-4 text-sm font-semibold text-app-primary-foreground transition hover:opacity-90"
                            >
                              Add secret
                            </button>
                          </form>

                          {environment.secrets.length === 0 ? (
                            <p className="py-5 text-sm text-app-muted">
                              No secrets in this environment.
                            </p>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-left text-sm">
                                <thead className="border-b border-app">
                                  <tr>
                                    <th className="px-5 py-4 font-semibold text-app-foreground">
                                      Key
                                    </th>
                                    <th className="px-5 py-4 font-semibold text-app-foreground">
                                      Value
                                    </th>
                                    <th className="px-5 py-4 font-semibold text-app-foreground">
                                      Created
                                    </th>
                                    <th className="px-5 py-4 font-semibold text-app-foreground">
                                      Action
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                  {environment.secrets.map((secret) => (
                                    <tr key={secret.id}>
                                      <td className="px-5 py-4 font-mono text-xs text-app-foreground">
                                        {secret.key}
                                      </td>
                                      <td className="px-5 py-4 font-mono text-xs text-app-muted">
                                        {maskSecret(secret.value)}
                                      </td>

                                      <td className="px-5 py-4 text-xs text-app-muted">
                                        {dateFormatter.format(secret.createdAt)}
                                      </td>
                                      <td className="px-5 py-4">
                                        <form action={deleteSecret}>
                                          <input
                                            type="hidden"
                                            name="secretId"
                                            value={secret.id}
                                          />
                                          <button
                                            type="submit"
                                            className="border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-400/15"
                                          >
                                            Delete
                                          </button>
                                        </form>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          <div className="mt-8 grid gap-8 lg:grid-cols-2">
                            {/* CLI Info */}
                            <div className="border-t border-app pt-6">
                              <h4 className="text-sm font-semibold text-app-foreground mb-4">
                                Connect via CLI
                              </h4>
                              <div className="bg-black/20 p-4 font-mono text-sm text-app-foreground overflow-x-auto border border-white/5">
                                <p className="mb-2 text-app-muted">
                                  This token only works for this environment:
                                </p>
                                <code className="block mb-2 text-white">
                                  npm install -g github:GarzvR/krypt-cli
                                </code>
                                <code className="block mb-4 text-white">
                                  krypt init --token=&lt;token&gt;
                                </code>
                                <code className="block mb-4 text-white">
                                  krypt pull
                                </code>
                                <p className="border-t border-white/5 pt-4 text-xs text-app-muted italic">
                                  Use the token generated on the right for
                                  authentication.
                                </p>
                              </div>
                            </div>

                            {/* API Keys */}
                            <div className="border-t border-app pt-6">
                              <h4 className="text-sm font-semibold text-app-foreground mb-4">
                                API Tokens
                              </h4>
                              <div className="space-y-4">
                                <form
                                  action={createApiKey}
                                  className="flex gap-2"
                                >
                                  <input
                                    type="hidden"
                                    name="environmentId"
                                    value={environment.id}
                                  />
                                  <input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="Token label (e.g. CI/CD)"
                                    className="h-10 flex-1 border border-app bg-transparent px-3 text-xs text-app-foreground outline-none focus:ring-1 focus:ring-app-primary"
                                  />
                                  <button
                                    type="submit"
                                    className="h-10 border border-app bg-app-primary px-4 text-xs font-bold text-app-primary-foreground hover:opacity-90 transition-opacity"
                                  >
                                    Generate
                                  </button>
                                </form>

                                <div className="space-y-2">
                                  {environment.apiKeys.length === 0 ? (
                                    <p className="text-[10px] text-app-muted italic">
                                      No tokens active.
                                    </p>
                                  ) : (
                                    environment.apiKeys.map((key) => (
                                      <div
                                        key={key.id}
                                        className="flex items-center justify-between border border-white/5 bg-white/[0.02] p-2 pr-1"
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <Command
                                            size={14}
                                            className="text-app-muted shrink-0"
                                          />
                                          <div className="min-w-0">
                                            <p className="text-[10px] font-semibold text-white truncate">
                                              {key.name}
                                            </p>
                                            <code className="text-[10px] text-app-muted font-mono">
                                              {key.key.substring(0, 6)}•••
                                            </code>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <CopyButton value={key.key} />
                                          <form action={deleteApiKey}>
                                            <input
                                              type="hidden"
                                              name="apiKeyId"
                                              value={key.id}
                                            />
                                            <button
                                              type="submit"
                                              className="p-1.5 text-rose-400/40 hover:text-rose-400 transition-colors"
                                              title="Revoke Token"
                                            >
                                              <CaretDown
                                                size={14}
                                                className="rotate-45"
                                              />{" "}
                                              {/* Placeholder for a better 'X' if needed */}
                                            </button>
                                          </form>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </details>
                    ))
                  )}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </section>
  );
}
