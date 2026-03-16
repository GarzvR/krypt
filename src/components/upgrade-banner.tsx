"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const messages: Record<string, string> = {
  projects:
    "Starter allows up to 1 project. Upgrade to Pro to create more projects.",
  environments:
    "Starter allows up to 3 environments. Upgrade to Pro to add more environments.",
  secrets:
    "Starter allows up to 50 secrets. Upgrade to Pro to keep growing your workspace.",
  "billing-success": "Your billing flow completed. Refresh in a moment if your plan has not updated yet.",
  "checkout-error":
    "Checkout is not available right now. Check your Lemon Squeezy configuration and try again.",
};

export function UpgradeBanner() {
  const searchParams = useSearchParams();
  const upgradeReason = searchParams.get("upgrade");
  const billingState = searchParams.get("billing");

  const message =
    (upgradeReason && messages[upgradeReason]) ||
    (billingState && messages[`billing-${billingState}`]) ||
    null;

  if (!message) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-col gap-4 border border-app bg-white/[0.03] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-app-foreground">{message}</p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/#pricing"
          className="inline-flex h-10 items-center border border-app bg-white/[0.04] px-4 text-sm font-medium text-app-foreground hover:bg-white/[0.08]"
        >
          View plans
        </Link>
        <Link
          href="/api/billing/checkout"
          className="inline-flex h-10 items-center border border-app bg-app-primary px-4 text-sm font-semibold text-app-primary-foreground hover:opacity-90"
        >
          Upgrade to Pro
        </Link>
      </div>
    </div>
  );
}
