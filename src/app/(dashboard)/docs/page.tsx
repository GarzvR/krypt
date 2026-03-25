"use client";

import { motion } from "framer-motion";
import { Copy, Check, Lightning, Shield, Devices } from "@phosphor-icons/react";
import { useEffect, useState, type ElementType } from "react";

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const SectionHeader = ({
  title,
  icon: Icon,
  colorClass = "text-app-primary",
}: {
  title: string;
  icon: ElementType;
  colorClass?: string;
}) => (
  <div className="flex items-center gap-3 mb-6">
    <div
      className={`p-2 rounded-lg bg-white/[0.03] border border-white/5 ${colorClass}`}
    >
      <Icon size={24} weight="duotone" />
    </div>
    <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
  </div>
);

export default function DocsPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [appOrigin, setAppOrigin] = useState("http://localhost:3000");

  useEffect(() => {
    setAppOrigin(window.location.origin);
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const CodeBlock = ({
    code,
    id,
    label,
    language = "bash",
  }: {
    code: string;
    id: string;
    label?: string;
    language?: string;
  }) => (
    <div className="group relative my-6">
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-x border-t border-white/10 text-[10px] font-mono text-app-muted">
        <span className="uppercase tracking-widest opacity-50">
          {label || language}
        </span>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="hover:text-white transition-colors flex items-center gap-1.5"
        >
          {copied === id ? (
            <Check size={12} className="text-emerald-400" />
          ) : (
            <Copy size={12} />
          )}
          {copied === id ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="relative border border-white/10 bg-black/40 p-5 font-mono text-sm shadow-2xl transition-all group-hover:border-app-primary/30">
        <code className="block pr-16 text-emerald-400/90 whitespace-pre-wrap leading-relaxed">
          {code}
        </code>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl py-12 px-6 pb-32">
      <motion.div {...fadeIn} className="mb-20 text-center">
        <div className="flex items-center justify-center gap-2 text-app-primary mb-6 text-xs font-bold uppercase tracking-[0.3em]">
          <Lightning size={18} weight="fill" />
          <span>Setup Guide</span>
        </div>
        <h1 className="text-5xl font-black tracking-tight text-white mb-8 lg:text-7xl">
          Documentation <span className="text-app-primary">Viewer</span>
        </h1>
        <div className="mx-auto h-1 w-20 bg-app-primary mb-8" />
        <p className="mx-auto text-xl text-app-muted leading-relaxed max-w-3xl">
          Krypt CLI is designed for speed and security. Log in once, link your projects interactively, and pull secrets with zero friction.
        </p>
      </motion.div>

      <div className="space-y-24">
        <motion.section {...fadeIn} transition={{ delay: 0.1 }}>
          <SectionHeader title="Install Once" icon={Devices} />

          <div className="space-y-8">
            <div className="prose prose-invert max-w-none">
              <p className="text-app-muted leading-relaxed bg-white/[0.02] border-l-2 border-app-primary p-4 mb-6 italic text-sm">
                Install the CLI globally from the GitHub repo or local folder, then use the
                <code> krypt </code>
                command anywhere.
              </p>

              <div className="space-y-12">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Step 1: Install globally
                  </h3>
                  <p className="text-xs text-app-muted">
                    One install, then the command is available system-wide.
                  </p>
                  <CodeBlock
                    id="global-install"
                    code="npm install -g github:GarzvR/krypt-cli"
                    label="From GitHub"
                  />
                  <p className="text-[10px] text-app-muted mt-2">
                    Or from local folder: <code>npm install -g ./cli</code>
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Step 2: Login to your account
                  </h3>
                  <p className="text-xs text-app-muted">
                    Sign in with your email and password to authorize your machine.
                  </p>
                  <CodeBlock
                    id="global-login"
                    code="krypt login"
                    label="Terminal"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Step 3: Link your project
                  </h3>
                  <p className="text-xs text-app-muted">
                    Interactively select your project and environment to link the directory.
                  </p>
                  <CodeBlock
                    id="global-link"
                    code="krypt link"
                    label="Terminal"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Step 4: Pull your secrets
                  </h3>
                  <p className="text-xs text-app-muted">
                    Verify the token scope, then write the matching env file.
                  </p>
                  <CodeBlock
                    id="global-info"
                    code="krypt info"
                    label="Terminal"
                  />
                  <CodeBlock
                    id="global-pull"
                    code="krypt pull"
                    label="Terminal"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section {...fadeIn} transition={{ delay: 0.2 }}>
          <SectionHeader
            title="CLI Reference"
            icon={Shield}
            colorClass="text-emerald-400"
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="group border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Check size={18} className="text-emerald-400" />
                <h4 className="font-bold text-white text-sm tracking-tight text-white mb-0">
                  Environment Isolation
                </h4>
              </div>
              <p className="text-xs text-app-muted leading-relaxed">
                Connect once globally. Then link individual project directories to specific environments. No more manual token management.
              </p>
            </div>

            <div className="group border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Lightning size={18} className="text-app-primary" />
                <h4 className="font-bold text-white text-sm tracking-tight text-white mb-0">
                  Custom API URL
                </h4>
              </div>
              <p className="text-xs text-app-muted leading-relaxed">
                If you want to point the CLI somewhere else, pass{" "}
                <code>--api-url</code> or set <code>KRYPT_API_URL</code>.
                <code className="block mt-2 text-[10px] text-white/50 bg-black/40 p-2 border border-white/5">
                  krypt info --api-url={appOrigin}/api/v1
                </code>
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
          {...fadeIn}
          transition={{ delay: 0.3 }}
          className="border border-white/5 bg-black/40 p-12"
        >
          <h3 className="text-xl font-bold text-white mb-2">Simple Flow</h3>
          <p className="text-sm text-app-muted mb-10 max-w-xl">
            This is the whole CLI flow most users need.
          </p>

          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-app-primary mb-4">
                Install
              </p>
              <CodeBlock
                id="simple-install"
                code="npm install -g github:GarzvR/krypt-cli"
                label="Terminal"
              />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-app-primary mb-4">
                Use
              </p>
              <CodeBlock
                id="simple-usage"
                code={`krypt login\nkrypt link\nkrypt pull`}
                label="Terminal"
              />
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
