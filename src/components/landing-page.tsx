"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { PLAN_DEFINITIONS } from "@/lib/plans";

type LandingPageProps = {
  currentUserEmail?: string | null;
};

const features = [
  {
    title: "Project and environment structure",
    body: "Create projects, add environments, and manage secrets inside a protected workspace.",
  },
  {
    title: "Encrypted secret storage",
    body: "New secret values are encrypted before they are stored and decrypted during export.",
  },
  {
    title: "Usage and workspace views",
    body: "Track projects, environments, secret counts, and workspace capacity from the dashboard.",
  },
];

const pricingPlans = [
  {
    id: PLAN_DEFINITIONS.starter.id,
    name: PLAN_DEFINITIONS.starter.name,
    price: PLAN_DEFINITIONS.starter.price,
    note: PLAN_DEFINITIONS.starter.monthlyPriceNote,
    highlight: "Best for trying Krypt",
    limits: [
      `${PLAN_DEFINITIONS.starter.projectLimit} project`,
      `${PLAN_DEFINITIONS.starter.environmentLimit} environments`,
      `${PLAN_DEFINITIONS.starter.secretLimit} secrets`,
    ],
    buttonLabel: "Start free",
  },
  {
    id: PLAN_DEFINITIONS.pro.id,
    name: PLAN_DEFINITIONS.pro.name,
    price: PLAN_DEFINITIONS.pro.price,
    note: PLAN_DEFINITIONS.pro.monthlyPriceNote,
    highlight: "Best for active workspaces",
    limits: [
      `${PLAN_DEFINITIONS.pro.projectLimit} projects`,
      `${PLAN_DEFINITIONS.pro.environmentLimit} environments`,
      `${PLAN_DEFINITIONS.pro.secretLimit} secrets`,
    ],
    buttonLabel: "Purchase Pro",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export function LandingPage({ currentUserEmail }: LandingPageProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-app text-app-foreground">
      <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
        <div className="absolute -top-[20%] h-[500px] w-[1000px] rounded-[100%] bg-app-primary/10 blur-[120px]" />
        <div className="absolute -right-[10%] top-[40%] h-[500px] w-[600px] rounded-[100%] bg-app-accent/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-12">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between border-b border-app/50 py-5"
        >
          <div className="flex items-center gap-10">
            <img src="/logo.png" alt="Krypt" className="h-8 w-auto" />

            <nav className="hidden items-center gap-8 md:flex">
              <a
                href="#home"
                className="text-sm font-medium text-white transition-colors duration-200 hover:text-app-primary"
              >
                Home
              </a>
              <a
                href="#features"
                className="text-sm font-medium text-white transition-colors duration-200 hover:text-app-primary"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium text-white transition-colors duration-200 hover:text-app-primary"
              >
                Pricing
              </a>
              <Link
                href="/docs"
                className="text-sm font-medium text-white transition-colors duration-200 hover:text-app-primary"
              >
                Docs
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {currentUserEmail ? (
              <>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="hidden border border-app/50 bg-white/[0.02] px-4 py-2 text-sm text-app-foreground backdrop-blur-sm sm:block"
                >
                  {currentUserEmail}
                </motion.div>
                <Link href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex h-10 items-center justify-center bg-app-primary px-5 text-sm font-semibold text-app-primary-foreground shadow-[0_0_20px_rgba(101,224,199,0.3)] transition-all hover:shadow-[0_0_30px_rgba(101,224,199,0.5)]"
                  >
                    Enter dashboard
                  </motion.button>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="inline-flex h-10 items-center border border-app bg-white/[0.04] px-4 text-sm font-medium text-app-foreground transition-colors hover:bg-white/[0.08]"
                >
                  Sign in
                </Link>
                <Link href="/sign-up">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex h-10 items-center justify-center bg-app-foreground px-5 text-sm font-semibold text-app-background transition-transform"
                  >
                    Start free
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        </motion.header>

        <section id="home" className="border-b border-app/50 py-20 lg:py-32">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl"
          >
            <motion.div
              variants={fadeUp}
              className="mb-6 inline-flex items-center border border-app-primary/30 bg-app-primary/5 px-3 py-1 text-sm text-app-primary"
            >
              <span className="mr-2 flex h-2 w-2 animate-pulse bg-app-primary" />
              Secure workspace for secrets
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="bg-gradient-to-b from-white to-white/70 bg-clip-text text-5xl font-bold leading-[1.1] tracking-tight text-transparent sm:text-7xl"
            >
              Manage projects, environments, and encrypted secrets in one clean
              dashboard.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="mt-8 max-w-2xl text-lg leading-relaxed text-app-muted"
            >
              Krypt gives you protected workspace access, encrypted secret
              storage, CLI pull flow, and clear usage visibility without the
              usual environment-variable chaos.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link href={currentUserEmail ? "/dashboard" : "/sign-up"}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex h-12 items-center justify-center bg-app-primary px-8 text-base font-semibold text-app-primary-foreground shadow-[0_0_20px_rgba(101,224,199,0.3)] transition-all hover:shadow-[0_0_30px_rgba(101,224,199,0.5)]"
                >
                  {currentUserEmail ? "Open dashboard" : "Create workspace"}
                </motion.button>
              </Link>
              <Link href="/sign-in">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex h-12 items-center justify-center border border-app/50 bg-white/[0.02] px-8 text-base font-medium text-app-foreground backdrop-blur-md transition-colors hover:bg-white/[0.08]"
                >
                  {currentUserEmail ? "Account active" : "Enter dashboard"}
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative mt-20 flex justify-center"
          >
            <div className="absolute inset-x-8 -top-10 h-40 bg-[radial-gradient(circle,_rgba(101,224,199,0.2),_transparent_60%)] blur-3xl" />
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-5xl overflow-hidden border border-app/40 bg-[#06101d]/90 p-1 shadow-[0_40px_100px_rgba(0,0,0,0.4)] backdrop-blur-xl"
            >
              <Image
                src="/assets/Mockup.png"
                alt="Krypt Dashboard Mockup"
                width={1024}
                height={600}
                className="block h-auto w-full"
                priority
              />
            </motion.div>
          </motion.div>
        </section>

        <section id="features" className="border-b border-app/50 py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-sm font-medium uppercase tracking-widest text-app-primary">
              Features
            </p>
            <h2 className="mt-4 bg-gradient-to-b from-white to-white/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
              Everything you need to secure your environment.
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mt-16 grid gap-6 md:grid-cols-3"
          >
            {features.map((feature) => (
              <motion.article
                key={feature.title}
                variants={fadeUp}
                whileHover={{
                  y: -5,
                  boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
                }}
                className="relative overflow-hidden border border-app/30 bg-white/[0.02] p-8 backdrop-blur-sm transition-colors hover:border-app-primary/30 hover:bg-white/[0.04]"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center border border-app-primary/20 bg-app-primary/10 text-app-primary">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-app-foreground">
                  {feature.title}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-app-muted">
                  {feature.body}
                </p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <section id="pricing" className="border-b border-app/50 py-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-sm font-medium uppercase tracking-widest text-app-primary">
              Pricing
            </p>
            <h2 className="mt-4 bg-gradient-to-b from-white to-white/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
              Start on Starter, move to Pro when your workspace outgrows it.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-app-muted">
              Krypt keeps pricing simple: Starter is free for lean setups, and
              Pro is for larger products, client work, and heavier secret usage.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-2"
          >
            {pricingPlans.map((plan) => (
              <motion.article
                key={plan.id}
                variants={fadeUp}
                className={`border p-8 backdrop-blur-sm ${
                  plan.id === "pro"
                    ? "border-app-primary/40 bg-app-primary/5"
                    : "border-app/30 bg-white/[0.02]"
                }`}
              >
                <p className="text-sm font-medium text-app-primary">
                  {plan.highlight}
                </p>
                <div className="mt-4 flex items-end gap-3">
                  <h3 className="text-3xl font-bold text-white">{plan.name}</h3>
                  <p className="text-sm text-app-muted">
                    {plan.price} {plan.note}
                  </p>
                </div>
                <div className="mt-6 space-y-3">
                  {plan.limits.map((item) => (
                    <div
                      key={item}
                      className="border border-app/30 bg-black/10 px-4 py-3 text-sm text-app-foreground"
                    >
                      {item}
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-sm leading-relaxed text-app-muted">
                  {plan.id === "starter"
                    ? "Starter is free and meant for testing, personal apps, or compact workspaces."
                    : "Pro is the paid plan for serious workspaces that need more projects, environments, and secrets."}
                </p>
                <div className="mt-6">
                  <Link
                    href={
                      plan.id === "pro"
                        ? currentUserEmail
                          ? "/api/billing/checkout"
                          : "/sign-in?redirectTo=%2Fapi%2Fbilling%2Fcheckout"
                        : currentUserEmail
                          ? "/dashboard"
                          : "/sign-up"
                    }
                    className={`inline-flex h-11 items-center justify-center px-5 text-sm font-semibold ${
                      plan.id === "pro"
                        ? "bg-app-primary text-app-primary-foreground"
                        : "border border-app bg-white/[0.03] text-app-foreground hover:bg-white/[0.08]"
                    }`}
                  >
                    {plan.buttonLabel}
                  </Link>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <footer className="mt-10 border-t border-app/30 py-10">
          <div className="flex items-center justify-between text-sm text-app-muted">
            <p>© 2026 Krypt. All rights reserved.</p>
            <div className="flex gap-6">
              <Link
                href="/docs"
                className="transition-colors hover:text-app-primary"
              >
                Documentation
              </Link>
              <Link
                href="/terms"
                className="transition-colors hover:text-app-primary"
              >
                Terms
              </Link>
              <Link
                href="/refund-policy"
                className="transition-colors hover:text-app-primary"
              >
                Refund Policy
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
