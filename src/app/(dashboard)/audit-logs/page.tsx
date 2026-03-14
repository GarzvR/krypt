import { requireAdmin } from "@/lib/admin";
import { getSessionUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  PROJECT_CREATED: { label: "Created Project", color: "text-emerald-400" },
  PROJECT_DELETED: { label: "Deleted Project", color: "text-rose-400" },
  ENVIRONMENT_CREATED: { label: "Created Environment", color: "text-emerald-400" },
  ENVIRONMENT_DELETED: { label: "Deleted Environment", color: "text-rose-400" },
  SECRET_CREATED: { label: "Created Secret", color: "text-emerald-400" },
  SECRET_UPDATED: { label: "Updated Secret", color: "text-amber-400" },
  SECRET_DELETED: { label: "Deleted Secret", color: "text-rose-400" },
  APIKEY_CREATED: { label: "Generated API Key", color: "text-emerald-400" },
  APIKEY_REVOKED: { label: "Revoked API Key", color: "text-rose-400" },
  SECRETS_PULLED: { label: "Pulled Secrets (CLI)", color: "text-sky-400" },
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function AuditLogsPage() {
  await requireAdmin();
  const sessionUserId = getSessionUserId()!;

  const logs = await prisma.auditLog.findMany({
    where: {
      project: {
        ownerId: sessionUserId,
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      project: { select: { name: true } },
    },
  });

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-app-foreground">
          Audit Logs
        </h1>
        <p className="mt-2 text-sm text-app-muted">
          Track every action made across your workspace. Latest 50 events.
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="border border-dashed border-app px-6 py-16 text-center">
          <p className="text-sm text-app-muted">
            No activity recorded yet. Start creating projects and secrets to see
            your audit trail here.
          </p>
        </div>
      ) : (
        <div className="border border-app">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-app bg-white/[0.03]">
                <tr>
                  <th className="px-5 py-4 font-semibold text-app-foreground">
                    Time
                  </th>
                  <th className="px-5 py-4 font-semibold text-app-foreground">
                    Action
                  </th>
                  <th className="px-5 py-4 font-semibold text-app-foreground">
                    Actor
                  </th>
                  <th className="px-5 py-4 font-semibold text-app-foreground">
                    Target
                  </th>
                  <th className="px-5 py-4 font-semibold text-app-foreground">
                    Project
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {logs.map((log) => {
                  const actionInfo = ACTION_LABELS[log.action] ?? {
                    label: log.action,
                    color: "text-app-muted",
                  };

                  return (
                    <tr key={log.id} className="hover:bg-white/[0.02]">
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-app-muted">
                        {dateFormatter.format(log.createdAt)}
                      </td>
                      <td className={`whitespace-nowrap px-5 py-4 text-xs font-semibold ${actionInfo.color}`}>
                        {actionInfo.label}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-app-foreground">
                        {log.actor}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-app-foreground">
                        <span className="mr-2 border border-app bg-white/[0.04] px-2 py-1 text-[10px] uppercase tracking-wider text-app-muted">
                          {log.targetType}
                        </span>
                        {log.targetName}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-app-muted">
                        {log.project.name}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
