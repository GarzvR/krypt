"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import Image from "next/image";

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



const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
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
    <main className="min-h-screen bg-app text-app-foreground overflow-hidden">
      {/* Premium Background Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden flex justify-center">
        <div className="absolute -top-[20%] w-[1000px] h-[500px] rounded-[100%] bg-app-primary/10 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[600px] h-[500px] rounded-[100%] bg-app-accent/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-12 z-10">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between border-b border-app/50 py-5"
        >
          <div className="flex items-center gap-10">
            <p className="text-xl font-bold text-white">
              Krypt
            </p>

            <nav className="hidden items-center gap-8 md:flex">
              <a href="#home" className="text-sm font-medium text-white hover:text-app-primary transition-colors duration-200">
                Home
              </a>
              <a href="#features" className="text-sm font-medium text-white hover:text-app-primary transition-colors duration-200">
                Features
              </a>
              <Link href="/docs" className="text-sm font-medium text-white hover:text-app-primary transition-colors duration-200">
                Docs
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {currentUserEmail ? (
              <>
                <motion.div whileHover={{ scale: 1.02 }} className="hidden border border-app/50 bg-white/[0.02] px-4 py-2 text-sm text-app-foreground sm:block backdrop-blur-sm">
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
                <Link href="/sign-in" className="inline-flex h-10 items-center border border-app bg-white/[0.04] px-4 text-sm font-medium text-app-foreground hover:bg-white/[0.08] transition-colors">
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
            <motion.div variants={fadeUp} className="inline-flex items-center border border-app-primary/30 bg-app-primary/5 px-3 py-1 text-sm text-app-primary mb-6">
              <span className="flex h-2 w-2 bg-app-primary mr-2 animate-pulse"></span>
              Secure workspace for secrets
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-5xl font-bold leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 sm:text-7xl">
              Manage projects, environments, and encrypted secrets in one clean dashboard.
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-8 max-w-2xl text-lg leading-relaxed text-app-muted">
              This project already includes authentication, protected dashboard
              routes, project and environment management, encrypted secret
              storage, and `.env` export flow.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
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

          {/* Visual Mockup */}
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
              className="relative overflow-hidden border border-app/40 bg-[#06101d]/90 p-1 shadow-[0_40px_100px_rgba(0,0,0,0.4)] backdrop-blur-xl max-w-5xl"
            >
              <Image 
                src="/assets/Mockup.png" 
                alt="Krypt Dashboard Mockup" 
                width={1024}
                height={600}
                className="w-full h-auto block"
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
            className="max-w-2xl text-center mx-auto"
          >
            <p className="text-sm font-medium text-app-primary uppercase tracking-widest">Features</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
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
                whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)" }}
                className="relative overflow-hidden border border-app/30 bg-white/[0.02] p-8 backdrop-blur-sm transition-colors hover:border-app-primary/30 hover:bg-white/[0.04]"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center bg-app-primary/10 text-app-primary border border-app-primary/20">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
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


        {/* Footer */}
        <footer className="border-t border-app/30 py-10 mt-10">
            <div className="flex justify-between items-center text-sm text-app-muted">
             <p>© 2026 Krypt. All rights reserved.</p>
             <div className="flex gap-6">
                <Link href="/docs" className="hover:text-app-primary transition-colors">Documentation</Link>
             </div>
           </div>
        </footer>
      </div>
    </main>
  );
}
