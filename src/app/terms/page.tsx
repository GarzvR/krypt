"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-app text-app-foreground selection:bg-app-primary/30">
      {/* Background Decor */}
      <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
        <div className="absolute -top-[10%] h-[400px] w-[800px] rounded-[100%] bg-app-primary/5 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-20 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link 
            href="/"
            className="text-sm font-bold text-app-primary border-b border-app-primary/0 hover:border-app-primary/100 transition-all uppercase tracking-widest mb-12 inline-block"
          >
            ← Back to Home
          </Link>

          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-8 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Terms of Service
          </h1>
          
          <p className="text-app-muted mb-12 italic">Last updated: March 17, 2026</p>

          <div className="space-y-12 prose prose-invert max-w-none prose-p:text-app-muted prose-headings:text-white prose-headings:tracking-tight prose-strong:text-white prose-a:text-app-primary">
            <section>
              <h2 className="text-xl font-bold uppercase tracking-wider text-app-primary/80 mb-4">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By accessing or using Krypt (the &quot;Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold uppercase tracking-wider text-app-primary/80 mb-4">2. Description of Service</h2>
              <p className="leading-relaxed">
                Krypt is a secret management platform that allows users to store, manage, and encrypt environment variables and sensitive configuration data. The service includes a web dashboard, API, and CLI tools.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold uppercase tracking-wider text-app-primary/80 mb-4">3. User Responsibilities</h2>
              <p className="leading-relaxed">
                You are solely responsible for:
              </p>
              <ul className="list-disc pl-5 mt-4 space-y-2 text-app-muted">
                <li>Maintaining the confidentiality of your account tokens and API keys.</li>
                <li>All activities that occur under your account.</li>
                <li>The content of the secrets stored within your workspace.</li>
                <li>Ensuring your use of the Service complies with applicable laws.</li>
              </ul>
              <div className="mt-6 p-4 border border-rose-500/10 bg-rose-500/5 text-xs text-rose-300 italic">
                Important: Krypt provides tools for encryption, but the core security of your tokens relies on your own management practices.
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold uppercase tracking-wider text-app-primary/80 mb-4">4. Pro Plan and Billing</h2>
              <p className="leading-relaxed">
                Payments for Krypt Pro are processed through <strong>Lemon Squeezy</strong>. By subscribing to a paid plan, you agree to their terms and conditions regarding payment processing and data handling.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold uppercase tracking-wider text-app-primary/80 mb-4">5. Account Termination</h2>
              <p className="leading-relaxed">
                We reserve the right to suspend or terminate your access to Krypt at our discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold uppercase tracking-wider text-app-primary/80 mb-4">6. Limitation of Liability</h2>
              <p className="leading-relaxed">
                Krypt is provided &quot;as is&quot; without any warranties. In no event shall Krypt be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits or data.
              </p>
            </section>

            <section className="pt-12 border-t border-app/30">
              <p className="text-sm text-app-muted">
                Questions about the Terms of Service should be sent to us at <span className="text-app-primary">support@getkrypt.dev</span>.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
