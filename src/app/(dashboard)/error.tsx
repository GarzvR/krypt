"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log the error to an error reporting service like Sentry
    console.error("Dashboard caught error:", error);
  }, [error]);

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center border border-dashed border-rose-500/30 bg-rose-500/5 px-6 py-16 text-center">
      <div className="mb-6 inline-flex h-16 w-16 items-center justify-center border border-rose-500/20 bg-rose-500/10 text-rose-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-8 w-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold tracking-tight text-app-foreground">
        Something went wrong.
      </h2>
      <p className="mt-2 text-sm text-app-muted max-w-md">
        We encountered an error while loading your workspace data. The database
        might be temporarily unreachable or there&apos;s a temporary glitch.
      </p>
      
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => reset()}
          className="h-11 border border-app-primary bg-app-primary/10 px-6 text-sm font-semibold text-app-primary transition hover:bg-app-primary/20"
        >
          Try again
        </button>
        <button
          onClick={() => window.location.href = "/"}
          className="h-11 border border-app bg-white/[0.04] px-6 text-sm font-medium text-app-foreground hover:bg-white/[0.08]"
        >
          Go back home
        </button>
      </div>
    </div>
  );
}
