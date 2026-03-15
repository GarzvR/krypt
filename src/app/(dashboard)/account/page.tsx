import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { createApiKey, deleteApiKey } from "@/actions/projects";
import { CopyButton } from "./copy-button";
import { 
  UserCircle, 
  ShieldCheck, 
  Calendar, 
  ShieldSlash,
  Monitor,
  Command
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
      },
    },
  });

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-white">Account Settings</h1>
        <p className="mt-2 text-sm text-app-muted">Manage your credentials and security settings.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Info */}
        <section className="border border-app bg-white/[0.03] p-6 space-y-6 lg:col-span-1">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center bg-app-primary/10 border border-app-primary/20 text-app-primary">
              <UserCircle size={32} weight="duotone" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.email}</p>
              <p className="text-[10px] text-app-muted uppercase tracking-wider">Free Workspace</p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-app space-y-4">
             <div className="flex justify-between items-center text-xs">
                <span className="text-app-muted">Created</span>
                <span className="text-white font-medium">{dateFormatter.format(user.createdAt)}</span>
             </div>
             <div className="flex justify-between items-center text-xs">
                <span className="text-app-muted">Account ID</span>
                <span className="text-app-muted font-mono bg-white/5 px-1 truncate max-w-[100px]">{user.id}</span>
             </div>
          </div>

          <div className="bg-emerald-400/5 border border-emerald-400/20 p-4 flex gap-3">
            <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-emerald-300">Identity Verified</p>
              <p className="text-[10px] text-emerald-300/70 leading-relaxed">Your tokens are stored with AES-256-GCM encryption.</p>
            </div>
          </div>
        </section>

        {/* API Keys Table */}
        <section className="lg:col-span-2 border border-app bg-white/[0.03] flex flex-col">
          <div className="border-b border-app bg-white/[0.02] px-6 py-4 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-white">Active API Tokens</h2>
            <span className="px-2 py-0.5 bg-app-primary/10 border border-app-primary/30 text-[10px] font-bold text-app-primary uppercase">
              {user.apiKeys.length} keys
            </span>
          </div>

          <div className="p-6 flex-1 space-y-6">
            <form action={createApiKey} className="flex gap-3">
              <input
                type="text"
                name="name"
                required
                placeholder="Key label (e.g. CLI Laptop)"
                className="h-10 flex-1 border border-app bg-black/20 px-3 text-xs text-app-foreground outline-none focus:ring-1 focus:ring-app-primary"
              />
              <button
                type="submit"
                className="h-10 bg-app-primary px-4 text-xs font-bold text-app-primary-foreground hover:opacity-90 transition-opacity"
              >
                Create
              </button>
            </form>

            <div className="space-y-2">
              {user.apiKeys.length === 0 ? (
                <p className="text-center py-8 text-xs text-app-muted border border-dashed border-app">No tokens generated.</p>
              ) : (
                user.apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="group border border-app bg-white/[0.01] p-3 flex items-center justify-between hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-center gap-3">
                      <Command size={16} className="text-app-muted" />
                      <div>
                        <p className="text-xs font-semibold text-white">{apiKey.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                           <code className="text-[10px] font-mono text-app-muted">{apiKey.key.substring(0, 8)}••••••••</code>
                           <CopyButton value={apiKey.key} />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                       <div className="hidden sm:block text-right">
                          <p className="text-[9px] text-app-muted uppercase tracking-widest">Last Access</p>
                          <p className="text-[10px] text-white/80">{apiKey.lastUsedAt ? dateFormatter.format(apiKey.lastUsedAt) : "Never"}</p>
                       </div>
                       <form action={deleteApiKey}>
                          <input type="hidden" name="apiKeyId" value={apiKey.id} />
                          <button type="submit" className="p-2 text-rose-400/40 hover:text-rose-400 transition-colors">
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
         <div className="border border-app p-4 space-y-2 bg-white/[0.02]">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Monitor size={16} className="text-app-primary" />
              Unified Access
            </h4>
            <p className="text-[10px] text-app-muted">Your universal keys work across all projects and environments instantly.</p>
         </div>
         <div className="border border-app p-4 space-y-2 bg-white/[0.02]">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Calendar size={16} className="text-app-primary" />
              Auto Rotation
            </h4>
            <p className="text-[10px] text-app-muted">We recommend rotating critical bridge tokens every 30 days for maximum safety.</p>
         </div>
      </footer>
    </div>
  );
}
