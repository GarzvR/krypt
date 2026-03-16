export type PlanId = "starter" | "pro";

export const PLAN_DEFINITIONS = {
  starter: {
    id: "starter",
    name: "Starter",
    price: "$0",
    monthlyPriceNote: "Free",
    projectLimit: 1,
    secretLimit: 50,
    environmentLimit: 3,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "$4.99",
    monthlyPriceNote: "per month",
    projectLimit: 10,
    secretLimit: 300,
    environmentLimit: 30,
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
  }
>;

export function resolvePlanId(planId?: string | null): PlanId {
  return planId === "pro" ? "pro" : "starter";
}

export function getCurrentPlan(planId?: string | null) {
  return PLAN_DEFINITIONS[resolvePlanId(planId)];
}

export function getRecommendedPlan(input: {
  projectCount: number;
  environmentCount: number;
  secretCount: number;
}) {
  if (
    input.projectCount > PLAN_DEFINITIONS.starter.projectLimit ||
    input.environmentCount > PLAN_DEFINITIONS.starter.environmentLimit ||
    input.secretCount > PLAN_DEFINITIONS.starter.secretLimit
  ) {
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

export function formatPlanLimit(limit: number) {
  return Number.isFinite(limit) ? `${limit}` : "Unlimited";
}
