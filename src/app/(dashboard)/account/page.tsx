import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { createApiKey, deleteApiKey } from "@/actions/projects";
import { CopyButton } from "./copy-button";
import {
  Calendar,
  Command,
  Monitor,
  ShieldCheck,
  ShieldSlash,
  UserCircle,
} from "@phosphor-icons/react/dist/ssr";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function AccountPage() {
  const sessionUserId = getSessionUserId();

  if (!sessionUserId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUserId },
    include: {
      apiKeys: {
        orderBy: { createdAt: "desc" },
        include: {
          environment: {
            include: {
              project: true,
            },
          },
        },
      },
      projects: {
        orderBy: { createdAt: "asc" },
        include: {
          environments: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  const allEnvironments = user.projects.flatMap((project) =>
    project.environments.map((environment) => ({
      id: environment.id,
      label: `${project.name} / ${environment.name}`,
    })),
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Account Settings
        </h1>
        <p className="mt-2 text-sm text-app-muted">
          Manage your credentials and environment-scoped access tokens for the
          Krypt CLI.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-6 border border-app bg-white/[0.03] p-6 lg:col-span-1">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center border border-app-primary/20 bg-app-primary/10 text-app-primary">
              <UserCircle size={32} weight="duotone" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {user.email}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-app-muted">
                Free Workspace
              </p>
            </div>
          </div>

          <div className="space-y-4 border-t border-app pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-app-muted">Created</span>
              <span className="font-medium text-white">
                {dateFormatter.format(user.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-app-muted">Account ID</span>
              <span className="max-w-[100px] truncate bg-white/5 px-1 font-mono text-app-muted">
                {user.id}
              </span>
            </div>
          </div>

          <div className="flex gap-3 border border-emerald-400/20 bg-emerald-400/5 p-4">
            <ShieldCheck size={20} className="shrink-0 text-emerald-400" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-emerald-300">
                Identity Verified
              </p>
              <p className="text-[10px] leading-relaxed text-emerald-300/70">
                Your tokens are stored with AES-256-GCM encryption.
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col border border-app bg-white/[0.03] lg:col-span-2">
          <div className="flex items-center justify-between border-b border-app bg-white/[0.02] px-6 py-4">
            <h2 className="text-sm font-semibold text-white">
              Active API Tokens
            </h2>
            <span className="border border-app-primary/30 bg-app-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-app-primary">
              {user.apiKeys.length} keys
            </span>
          </div>

          <div className="flex-1 space-y-6 p-6">
            <form
              action={createApiKey}
              className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]"
            >
              <input
                type="text"
                name="name"
                required
                placeholder="Key label (e.g. CLI Laptop)"
                className="h-10 border border-app bg-black/20 px-3 text-xs text-app-foreground outline-none focus:ring-1 focus:ring-app-primary"
              />
              <select
                name="environmentId"
                required
                defaultValue=""
                className="h-10 border border-app bg-black/20 px-3 text-xs text-app-foreground outline-none focus:ring-1 focus:ring-app-primary"
              >
                <option value="" disabled>
                  Select environment
                </option>
                {allEnvironments.map((environment) => (
                  <option key={environment.id} value={environment.id}>
                    {environment.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="h-10 bg-app-primary px-4 text-xs font-bold text-app-primary-foreground transition-opacity hover:opacity-90"
              >
                Create
              </button>
            </form>

            <div className="space-y-2">
              {user.apiKeys.length === 0 ? (
                <p className="border border-dashed border-app py-8 text-center text-xs text-app-muted">
                  No tokens generated.
                </p>
              ) : (
                user.apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="group flex items-center justify-between border border-app bg-white/[0.01] p-3 transition-colors hover:bg-white/[0.03]"
                  >
                    <div className="flex items-center gap-3">
                      <Command size={16} className="text-app-muted" />
                      <div>
                        <p className="text-xs font-semibold text-white">
                          {apiKey.name}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <code className="text-[10px] font-mono text-app-muted">
                            {apiKey.key.substring(0, 8)}...
                          </code>
                          <CopyButton value={apiKey.key} />
                        </div>
                        <p className="mt-1 text-[10px] text-app-muted">
                          {apiKey.environment.project.name} /{" "}
                          {apiKey.environment.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="hidden text-right sm:block">
                        <p className="text-[9px] uppercase tracking-widest text-app-muted">
                          Last Access
                        </p>
                        <p className="text-[10px] text-white/80">
                          {apiKey.lastUsedAt
                            ? dateFormatter.format(apiKey.lastUsedAt)
                            : "Never"}
                        </p>
                      </div>
                      <form action={deleteApiKey}>
                        <input
                          type="hidden"
                          name="apiKeyId"
                          value={apiKey.id}
                        />
                        <button
                          type="submit"
                          className="p-2 text-rose-400/40 transition-colors hover:text-rose-400"
                        >
                          <ShieldSlash size={16} />
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      <footer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2 border border-app bg-white/[0.02] p-4">
          <h4 className="flex items-center gap-2 text-xs font-bold text-white">
            <Monitor size={16} className="text-app-primary" />
            Environment Scope
          </h4>
          <p className="text-[10px] text-app-muted">
            Each token only works for the environment it was created for.
          </p>
        </div>
        <div className="space-y-2 border border-app bg-white/[0.02] p-4">
          <h4 className="flex items-center gap-2 text-xs font-bold text-white">
            <Calendar size={16} className="text-app-primary" />
            Auto Rotation
          </h4>
          <p className="text-[10px] text-app-muted">
            Rotate critical tokens every 30 days for better operational hygiene.
          </p>
        </div>
        <div className="space-y-2 border border-app bg-white/[0.02] p-4">
          <h4 className="flex items-center gap-2 text-xs font-bold text-white">
            <Command size={16} className="text-app-primary" />
            CLI Quick Start
          </h4>
          <p className="text-[10px] text-app-muted">
            Install globally with{" "}
            <code>npm install -g github:GarzvR/krypt-cli</code>, then run{" "}
            <code>krypt init --token=&lt;token&gt;</code>.
          </p>
        </div>
      </footer>
    </div>
  );
}
