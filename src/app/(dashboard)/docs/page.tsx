"use client";

import { motion } from "framer-motion";
import { 
  Copy,
  Check,
  Lightning,
  Shield,
  Devices
} from "@phosphor-icons/react";
import { useState } from "react";
import Link from "next/link";

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

const SectionHeader = ({ title, icon: Icon, colorClass = "text-app-primary" }: { title: string, icon: any, colorClass?: string }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className={`p-2 rounded-lg bg-white/[0.03] border border-white/5 ${colorClass}`}>
      <Icon size={24} weight="duotone" />
    </div>
    <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
  </div>
);

export default function DocsPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const CodeBlock = ({ code, id, label, language = "bash" }: { code: string, id: string, label?: string, language?: string }) => (
    <div className="group relative my-6">
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-x border-t border-white/10 text-[10px] font-mono text-app-muted">
        <span className="uppercase tracking-widest opacity-50">{label || language}</span>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="hover:text-white transition-colors flex items-center gap-1.5"
        >
          {copied === id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
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
    <div className="mx-auto max-w-4xl py-12 px-4 pb-32">
      <motion.div {...fadeIn} className="mb-16">
        <div className="flex items-center gap-2 text-app-primary mb-4 text-xs font-bold uppercase tracking-[0.2em]">
          <Lightning size={16} weight="fill" />
          <span>Setup Guide</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white mb-6 lg:text-5xl">
          Documentation <span className="text-app-primary">Viewer</span>
        </h1>
        <p className="text-lg text-app-muted leading-relaxed max-w-2xl">
          Krypt provides a powerful CLI to manage your secrets. 
          Follow the instructions below to get your local development environment synced.
        </p>
      </motion.div>

      <div className="space-y-24">
        {/* Local Dev Section */}
        <motion.section {...fadeIn} transition={{ delay: 0.1 }}>
          <SectionHeader title="Testing Locally" icon={Devices} />
          
          <div className="space-y-8">
            <div className="prose prose-invert max-w-none">
              <p className="text-app-muted leading-relaxed bg-white/[0.02] border-l-2 border-app-primary p-4 mb-6 italic text-sm">
                Since you're currently in development mode, use the local path to the CLI 
                to test your changes instantly.
              </p>
              
              <div className="space-y-12">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Method A: Direct Execution (Recommended)</h3>
                  <p className="text-xs text-app-muted">Run the script directly from your project root using Node.js.</p>
                  <CodeBlock 
                    id="local-init" 
                    code="node cli/krypt.js init" 
                    label="Terminal / Root"
                  />
                  <CodeBlock 
                    id="local-pull" 
                    code="node cli/krypt.js pull" 
                    label="Terminal / Root"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Method B: Using NPX</h3>
                  <p className="text-xs text-app-muted">If you are in a subdirectory (like <code>/test-cli</code>), point to the local package.</p>
                  <CodeBlock 
                    id="npx-local" 
                    code="npx ../cli init" 
                    label="Terminal / Subdirectory"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Pro Tips */}
        <motion.section {...fadeIn} transition={{ delay: 0.2 }}>
          <SectionHeader title="CLI Reference" icon={Shield} colorClass="text-emerald-400" />
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="group border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Check size={18} className="text-emerald-400" />
                <h4 className="font-bold text-white text-sm tracking-tight text-white mb-0">Environment Isolation</h4>
              </div>
              <p className="text-xs text-app-muted leading-relaxed">
                Tokens are now generated per environment. A token created for `Development` 
                cannot be used to pull `Production` secrets.
              </p>
            </div>
            
            <div className="group border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.04] transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Lightning size={18} className="text-app-primary" />
                <h4 className="font-bold text-white text-sm tracking-tight text-white mb-0">Local API Sync</h4>
              </div>
              <p className="text-xs text-app-muted leading-relaxed">
                To test against your local dev server, set the API URL:
                <code className="block mt-2 text-[10px] text-white/50 bg-black/40 p-2 border border-white/5 uppercase">export KRYPT_API_URL=http://localhost:3000/api/v1</code>
              </p>
            </div>
          </div>
        </motion.section>

        {/* Global Installation */}
        <motion.section {...fadeIn} transition={{ delay: 0.3 }} className="border border-white/5 bg-black/40 p-12">
          <h3 className="text-xl font-bold text-white mb-2">Public Access (One-liner)</h3>
          <p className="text-sm text-app-muted mb-10 max-w-xl">
            External users can run Krypt instantly without downloading any files. 
            Give them this public one-liner to initialize their project.
          </p>

          <div className="space-y-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-app-primary mb-4">Official One-liner</p>
              <CodeBlock id="curl-pub" code="curl -sL https://krypt.sh/api/raw/cli | node - init" label="Universal / Public" />
              <p className="mt-4 text-[10px] text-app-muted italic">
                Note: Replace <code>krypt.sh</code> with your actual deployed domain.
              </p>
            </div>
            
            <div className="p-4 bg-emerald-400/5 border border-emerald-400/20 rounded text-xs text-emerald-400/80 leading-relaxed text-center">
              Once Published to NPM: <code className="text-white ml-2">npx krypt-cli init</code>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
