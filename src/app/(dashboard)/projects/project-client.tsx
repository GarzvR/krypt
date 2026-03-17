"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Trash,
  Globe,
  Flask,
  ShieldCheck,
  Key as KeyIcon,
  X,
  Lightning,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { CopyButton } from "@/components/copy-button";
import { SmartForm, SubmitButton } from "@/components/smart-form";

function maskSecret(value: string) {
  return "*".repeat(Math.min(Math.max(value.length, 6), 16));
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

interface Environment {
  id: string;
  name: string;
  projectId: string;
  createdAt: Date;
  secrets: {
    id: string;
    key: string;
    value: string;
    createdAt: Date;
  }[];
  apiKeys: {
    id: string;
    name: string;
    key: string;
  }[];
  project: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Project {
  id: string;
  name: string;
  slug: string;
  environments: Environment[];
}

export function ProjectClient({
  projects: initialProjects,
  actions,
}: {
  projects: Project[];
  actions: {
    createProject: (formData: FormData) => Promise<void>;
    createEnvironment: (formData: FormData) => Promise<void>;
    deleteProject: (formData: FormData) => Promise<void>;
    deleteEnvironment: (formData: FormData) => Promise<void>;
    createSecret: (formData: FormData) => Promise<void>;
    deleteSecret: (formData: FormData) => Promise<void>;
    createApiKey: (formData: FormData) => Promise<void>;
    deleteApiKey: (formData: FormData) => Promise<void>;
  };
}) {
  const [activeEnvironments, setActiveEnvironments] = useState<
    Record<string, string>
  >(() => {
    const initial: Record<string, string> = {};
    initialProjects.forEach((p) => {
      if (p.environments.length > 0) {
        // Find development if it exists, otherwise first one
        const devEnv = p.environments.find(
          (e) => e.name === "development",
        );
        initial[p.id] = devEnv ? "development" : p.environments[0].name;
      } else {
        initial[p.id] = "development";
      }
    });
    return initial;
  });

  const [activeSheetProject, setActiveSheetProject] = useState<string | null>(
    null,
  );

  const totals = initialProjects.reduce(
    (accumulator, project) => {
      accumulator.environments += project.environments.length;
      accumulator.secrets += project.environments.reduce(
        (secretTotal: number, environment) =>
          secretTotal + environment.secrets.length,
        0,
      );
      return accumulator;
    },
    { environments: 0, secrets: 0 },
  );

  return (
    <div className="relative space-y-8">
      {/* Side Sheet Modal */}
      <AnimatePresence>
        {activeSheetProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSheetProject(null)}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-[101] flex w-full max-w-[400px] flex-col overflow-hidden border-l border-app bg-app shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-app px-6 py-5">
                <div>
                  <h3 className="text-lg font-medium tracking-tight text-app-foreground">
                    New environment
                  </h3>
                  <p className="mt-1 text-xs text-app-muted">
                    Create a separate workspace for this project.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSheetProject(null)}
                  className="p-2 hover:bg-white/[0.05] border border-app transition-colors text-app-muted hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 flex-1">
                <SmartForm
                  action={async (formData: FormData) => {
                    await actions.createEnvironment(formData);
                    const name = formData.get("name") as string;
                    setActiveEnvironments((prev) => ({
                      ...prev,
                      [activeSheetProject]: name,
                    }));
                    setActiveSheetProject(null);
                  }}
                  className="space-y-6"
                >
                  <input
                    type="hidden"
                    name="projectId"
                    value={activeSheetProject}
                  />
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-app-muted">
                      Environment name
                    </label>
                    <input
                      name="name"
                      autoFocus
                      autoComplete="off"
                      placeholder="e.g. production, staging, testing"
                      className="h-12 w-full border border-app bg-[var(--app-background-soft)] px-4 text-sm font-medium outline-none transition-all placeholder:opacity-20 focus:ring-2 ring-app-primary"
                      required
                    />
                    <p className="text-[11px] text-app-muted/70">
                      Use lowercase and avoid spaces.
                    </p>
                  </div>

                  <div className="pt-4">
                    <SubmitButton className="h-11 w-full border border-app bg-app-primary px-4 text-sm font-medium text-app-primary-foreground transition hover:opacity-90">
                      Create environment
                    </SubmitButton>
                  </div>
                </SmartForm>
              </div>

              <div className="border-t border-app bg-[var(--app-background-soft)] p-6">
                <div className="flex items-center gap-3 text-app-muted/40">
                  <ShieldCheck size={16} />
                  <p className="text-[11px] text-app-muted/70">
                    Standard isolation is active.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid gap-0 border border-app md:grid-cols-3">
        {[
          { label: "Projects", value: initialProjects.length },
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

      {/* Create Project */}
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

        <SmartForm
          action={actions.createProject}
          className="grid gap-3 p-5 lg:grid-cols-[minmax(0,1fr)_auto]"
        >
          <input
            type="text"
            name="name"
            required
            placeholder="Project name"
            className="h-12 border border-app bg-transparent px-4 text-sm text-app-foreground outline-none ring-app-primary placeholder:text-app-muted focus:ring-2"
          />
          <SubmitButton className="h-12 border border-app bg-app-primary px-5 text-sm font-semibold text-app-primary-foreground transition hover:opacity-90">
            Create project
          </SubmitButton>
        </SmartForm>
      </section>

      {/* Projects List */}
      {initialProjects.length === 0 ? (
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
          {initialProjects.map((project) => {
            const environmentMap = new Map<string, Environment>(
              project.environments.map((env) => [env.name, env]),
            );

            const activeEnvName = activeEnvironments[project.id];
            const activeEnv = environmentMap.get(activeEnvName) as
              | Environment
              | undefined;

            // Sort environments so development is first, then alphabetical
            const projectEnvs = [...project.environments].sort(
              (a, b) => {
                if (a.name === "development") return -1;
                if (b.name === "development") return 1;
                return a.name.localeCompare(b.name);
              },
            );

            return (
              <div
                key={project.id}
                className="border border-app bg-white/[0.03] overflow-hidden"
              >
                {/* Project Header */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-app px-5 py-5 gap-5">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-app-foreground">
                      {project.name}
                    </h2>
                    <p className="mt-2 text-sm text-app-muted">
                      /{project.slug}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Persistent Development Tab */}
                    {!environmentMap.has("development") && (
                      <button
                        onClick={() =>
                          setActiveEnvironments((prev) => ({
                            ...prev,
                            [project.id]: "development",
                          }))
                        }
                        className={`px-3 py-2 text-xs font-semibold capitalize border transition-all ${
                          activeEnvName === "development"
                            ? "border-emerald-400/50 bg-emerald-400/20 text-emerald-300 ring-2 ring-emerald-400/10"
                            : "border-dashed border-app/50 bg-transparent text-app-muted/40 hover:text-app-muted hover:border-app"
                        }`}
                      >
                        development
                      </button>
                    )}

                    {/* Existing Envs */}
                    {projectEnvs.map((env) => (
                      <button
                        key={env.id}
                        onClick={() =>
                          setActiveEnvironments((prev) => ({
                            ...prev,
                            [project.id]: env.name,
                          }))
                        }
                        className={`px-3 py-2 text-xs font-semibold capitalize border transition-all ${
                          activeEnvName === env.name
                            ? "border-emerald-400/50 bg-emerald-400/20 text-emerald-300 ring-2 ring-emerald-400/10"
                            : "border-app bg-white/[0.04] text-app-muted hover:text-app-foreground hover:bg-white/[0.08]"
                        }`}
                      >
                        {env.name}
                      </button>
                    ))}

                    {/* Add Environment Toggle */}
                    <button
                      onClick={() => setActiveSheetProject(project.id)}
                      className="flex items-center gap-1 px-3 py-2 text-xs font-semibold border border-app bg-white/[0.04] text-app-foreground hover:bg-white/[0.08] transition-colors"
                    >
                      <Plus size={14} weight="bold" />
                      <span>Add Env</span>
                    </button>

                    <div className="h-4 w-px bg-white/10 mx-1" />

                    <form action={actions.deleteProject}>
                      <input
                        type="hidden"
                        name="projectId"
                        value={project.id}
                      />
                      <button className="px-3 py-2 text-xs font-semibold border border-rose-400/25 bg-rose-400/10 text-rose-300 hover:bg-rose-400/20">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>

                {/* Environment Content */}
                <div className="p-5 min-h-[400px]">
                  {activeEnv ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-1 duration-300">
                      {/* Secret Form */}
                      <SmartForm
                        action={actions.createSecret}
                        className="grid gap-3 border-b border-app pb-8 xl:grid-cols-[1.2fr_1.2fr_1fr_auto]"
                      >
                        <input
                          type="hidden"
                          name="environmentId"
                          value={activeEnv.id}
                        />
                        <input
                          name="key"
                          required
                          placeholder="API_KEY"
                          className="h-11 border border-app bg-transparent px-3 text-sm text-app-foreground outline-none focus:ring-2 ring-app-primary"
                        />
                        <input
                          name="value"
                          required
                          placeholder="Secret value"
                          className="h-11 border border-app bg-transparent px-3 text-sm text-app-foreground outline-none focus:ring-2 ring-app-primary"
                        />
                        <input
                          name="description"
                          placeholder="Description"
                          className="h-11 border border-app bg-transparent px-3 text-sm text-app-foreground outline-none focus:ring-2 ring-app-primary"
                        />
                        <SubmitButton className="h-11 bg-app-primary px-4 text-sm font-semibold text-app-primary-foreground">
                          Add secret
                        </SubmitButton>
                      </SmartForm>

                      {/* Secrets Table */}
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
                              <th className="px-5 py-4 font-semibold text-app-foreground text-app-muted/50 font-normal">
                                Created
                              </th>
                              <th className="px-5 py-4 font-semibold text-app-foreground text-right">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {activeEnv.secrets.map((secret) => (
                              <tr
                                key={secret.id}
                                className="group hover:bg-white/[0.01]"
                              >
                                <td className="px-5 py-4 font-mono text-xs text-app-foreground">
                                  {secret.key}
                                </td>
                                <td className="px-5 py-4 font-mono text-xs text-app-muted">
                                  {maskSecret(secret.value)}
                                </td>
                                <td className="px-5 py-4 text-xs text-app-muted italic text-[10px]">
                                  {dateFormatter.format(new Date(secret.createdAt))}
                                </td>
                                <td className="px-5 py-4 text-right">
                                  <form action={actions.deleteSecret}>
                                    <input
                                      type="hidden"
                                      name="secretId"
                                      value={secret.id}
                                    />
                                    <button className="text-rose-400/40 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100">
                                      <Trash size={16} />
                                    </button>
                                  </form>
                                </td>
                              </tr>
                            ))}
                            {activeEnv.secrets.length === 0 && (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="py-20 text-center text-sm text-app-muted italic opacity-50"
                                >
                                  No secrets in {activeEnv.name} yet.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Bottom Tools */}
                      <div className="grid gap-8 lg:grid-cols-2 pt-8 border-t border-app">
                        <div className="border border-white/5 bg-black/20 p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <Lightning size={16} className="text-app-primary" />
                            <h4 className="text-sm font-medium text-app-foreground">
                              CLI access
                            </h4>
                          </div>
                          <div className="font-mono text-[11px] space-y-3">
                            <p className="text-app-muted">
                              Point your local setup to {activeEnv.name}.
                            </p>
                            <div className="bg-black/40 border border-white/5 p-4 rounded-sm">
                              <code className="block text-emerald-400 mb-1">
                                krypt init --token=&lt;token&gt;
                              </code>
                              <code className="block text-emerald-400">
                                krypt pull
                              </code>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                              <span className="text-[10px] text-app-muted">
                                Manual download
                              </span>
                              <a
                                href={`/api/environments/${activeEnv.id}/export`}
                                className="text-[11px] font-medium text-app-primary transition-opacity hover:opacity-80"
                              >
                                Export .env
                              </a>
                            </div>
                          </div>
                        </div>

                        <div className="border border-white/5 bg-black/20 p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <ShieldCheck
                              size={16}
                              className="text-app-primary"
                            />
                            <h4 className="text-sm font-medium text-app-foreground">
                              API tokens
                            </h4>
                          </div>
                          <SmartForm
                            action={actions.createApiKey}
                            className="flex gap-2 mb-6"
                          >
                            <input
                              type="hidden"
                              name="environmentId"
                              value={activeEnv.id}
                            />
                            <input
                              name="name"
                              required
                              placeholder="Label (e.g. Vercel)"
                              className="h-10 flex-1 bg-transparent border border-app px-3 text-xs outline-none focus:ring-1 ring-app-primary placeholder:opacity-40"
                            />
                            <SubmitButton className="h-10 bg-app-primary px-4 text-xs font-medium text-app-primary-foreground">
                              New token
                            </SubmitButton>
                          </SmartForm>
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {activeEnv.apiKeys.map((key) => (
                              <div
                                key={key.id}
                                className="flex items-center justify-between border border-white/5 bg-white/[0.02] p-2 hover:bg-white/[0.04] transition-colors"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <KeyIcon
                                    size={12}
                                    className="text-app-muted"
                                  />
                                  <span className="truncate text-[10px] font-medium">
                                    {key.name}
                                  </span>
                                  <code className="text-[10px] text-app-muted opacity-50">
                                    ({key.key.slice(0, 6)}...)
                                  </code>
                                </div>
                                <div className="flex items-center gap-1">
                                  <CopyButton value={key.key} />
                                  <form action={actions.deleteApiKey}>
                                    <input
                                      type="hidden"
                                      name="apiKeyId"
                                      value={key.id}
                                    />
                                    <button className="p-1 text-rose-400/40 hover:text-rose-400 transition-colors">
                                      <X size={12} />
                                    </button>
                                  </form>
                                </div>
                              </div>
                            ))}
                            {activeEnv.apiKeys.length === 0 && (
                              <p className="text-[10px] text-app-muted italic opacity-50 py-2">
                                No active tokens.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-8 border-t border-app opacity-30 group hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2 text-xs text-app-muted">
                          <Globe size={14} />
                          <span>Environment ID: {activeEnv.id}</span>
                        </div>
                        <form action={actions.deleteEnvironment}>
                          <input
                            type="hidden"
                            name="environmentId"
                            value={activeEnv.id}
                          />
                          <button className="text-[10px] font-black uppercase tracking-widest text-rose-400/60 hover:text-rose-400">
                            Destroy Environment
                          </button>
                        </form>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-center animate-in fade-in duration-500">
                      <div className="p-8 rounded-full bg-white/[0.02] border border-white/5 mb-6">
                        <Flask
                          size={48}
                          className="text-app-primary opacity-40"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">
                        Environment Not Active
                      </h3>
                      <p className="text-sm text-app-muted max-w-sm mb-8 leading-relaxed">
                        The{" "}
                        <span className="text-white font-bold">
                          {activeEnvName}
                        </span>{" "}
                        environment hasn&apos;t been initialized for this project
                        yet.
                      </p>
                      <SmartForm
                        action={async (formData: FormData) => {
                          await actions.createEnvironment(formData);
                          // The page will revalidate and the environment will now exist
                        }}
                      >
                        <input
                          type="hidden"
                          name="projectId"
                          value={project.id}
                        />
                        <input
                          type="hidden"
                          name="name"
                          value={activeEnvName}
                        />
                        <SubmitButton className="h-12 border border-app-primary bg-app-primary/10 px-8 text-sm font-black uppercase tracking-[0.2em] text-app-primary hover:bg-app-primary hover:text-app-primary-foreground transition-all">
                          Initialize {activeEnvName}
                        </SubmitButton>
                      </SmartForm>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
