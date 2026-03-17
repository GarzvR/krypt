"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function RefundPolicyPage() {
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
            Refund Policy
          </h1>
          
          <p className="text-app-muted mb-12 italic">Last updated: March 17, 2026</p>

          <div className="space-y-12 prose prose-invert max-w-none prose-p:text-app-muted prose-headings:text-white prose-headings:tracking-tight prose-strong:text-white prose-a:text-app-primary">
            <section>
              <h2 className="text-xl font-bold uppercase tracking-wider text-app-primary/80 mb-4">1. Subscription Plans</h2>
              <p className="leading-relaxed">
                Krypt Pro is a digital subscription service. Fees are billed on a recurring basis (monthly or annually) depending on the plan you select. You acknowledge that your subscription starts immediately upon payment and provides immediate access to Pro features.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold uppercase tracking-wider text-app-primary/80 mb-4">2. General Refund Terms</h2>
              <p className="leading-relaxed">
                As Krypt is a software-as-a-service (SaaS) product with immediate delivery of value, all sales are final. <strong>Refunds are generally not provided</strong> for unused portions of your subscription period or for a change of mind.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold uppercase tracking-wider text-app-primary/80 mb-4">3. Exceptional Circumstances</h2>
              <p className="leading-relaxed">
                We may evaluate refund requests on a case-by-case basis under the following circumstances:
              </p>
              <ul className="list-disc pl-5 mt-4 space-y-2 text-app-muted">
                <li>Double charging due to technical errors.</li>
                <li>Proven technical failures that prevent access to the service for an extended period.</li>
                <li>Unauthorized transactions that were immediately flagged to our support team.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold uppercase tracking-wider text-app-primary/80 mb-4">4. Cancellation</h2>
              <p className="leading-relaxed">
                You can cancel your subscription at any time through your billing portal. Cancellation will stop future charges, and your active Pro features will remain available until the end of your current billing period.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold uppercase tracking-wider text-app-primary/80 mb-4">5. Chargebacks</h2>
              <p className="leading-relaxed text-rose-300">
                Initiating a chargeback or payment dispute without first contacting our support team will result in the immediate and permanent suspension of your Krypt workspace and account.
              </p>
            </section>

            <section className="pt-12 border-t border-app/30">
              <p className="text-sm text-app-muted">
                For refund inquiries or billing support, please contact <span className="text-app-primary">billing@getkrypt.dev</span>.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
