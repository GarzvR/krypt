export type PlanId = "starter" | "pro" | "team";

export const PLAN_DEFINITIONS = {
  starter: {
    id: "starter",
    name: "Starter",
    price: "$0",
    monthlyPriceNote: "Free",
    projectLimit: 999999,
    secretLimit: 999999,
    environmentLimit: 999999,
    workspaceLimit: 1,
    seatLimit: 1,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "$9",
    monthlyPriceNote: "per month",
    projectLimit: 10,
    secretLimit: 1000,
    environmentLimit: Number.POSITIVE_INFINITY,
    workspaceLimit: 1,
    seatLimit: 1,
  },
  team: {
    id: "team",
    name: "Team",
    price: "$29",
    monthlyPriceNote: "per month",
    projectLimit: Number.POSITIVE_INFINITY,
    secretLimit: 5000,
    environmentLimit: Number.POSITIVE_INFINITY,
    workspaceLimit: 1,
    seatLimit: 20,
  },
} as const satisfies Record<
  PlanId,
  {
    id: PlanId;
    name: string;
    price: string;
    monthlyPriceNote: string;
    projectLimit: number;
    secretLimit: number;
    environmentLimit: number;
    workspaceLimit: number;
    seatLimit: number;
  }
>;

export function getCurrentPlan() {
  return PLAN_DEFINITIONS.starter;
}

export function getRecommendedPlan(secretCount: number) {
  if (secretCount > PLAN_DEFINITIONS.pro.secretLimit) {
    return PLAN_DEFINITIONS.team;
  }

  if (secretCount > PLAN_DEFINITIONS.starter.secretLimit) {
    return PLAN_DEFINITIONS.pro;
  }

  return PLAN_DEFINITIONS.starter;
}

export function getSecretUsage(secretCount: number, secretLimit: number) {
  if (secretLimit <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((secretCount / secretLimit) * 100));
}

export function hasReachedLimit(currentCount: number, limit: number) {
  if (!Number.isFinite(limit)) {
    return false;
  }

  return currentCount >= limit;
}
