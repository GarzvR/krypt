import crypto from "crypto";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { getCurrentPlan, resolvePlanId, type PlanId } from "@/lib/plans";

const LEMON_API_BASE = "https://api.lemonsqueezy.com/v1";

export function getPlanForUser(planId?: string | null) {
  return getCurrentPlan(planId);
}

export function requireBillingConfig() {
  if (
    !env.LEMON_SQUEEZY_API_KEY ||
    !env.LEMON_SQUEEZY_STORE_ID ||
    !env.LEMON_SQUEEZY_PRO_VARIANT_ID
  ) {
    throw new Error("Lemon Squeezy billing is not configured.");
  }

  return {
    apiKey: env.LEMON_SQUEEZY_API_KEY,
    storeId: env.LEMON_SQUEEZY_STORE_ID,
    proVariantId: env.LEMON_SQUEEZY_PRO_VARIANT_ID,
  };
}

export async function createProCheckout(input: {
  userId: string;
  email: string;
  successUrl?: string;
}) {
  const config = requireBillingConfig();

  const response = await fetch(`${LEMON_API_BASE}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: input.email,
            custom: {
              user_id: input.userId,
              target_plan: "pro",
            },
          },
          checkout_options: {
            embed: false,
            media: false,
            logo: true,
          },
          product_options: {
            redirect_url:
              input.successUrl ?? "https://getkrypt.dev/settings?billing=success",
          },
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: config.storeId,
            },
          },
          variant: {
            data: {
              type: "variants",
              id: config.proVariantId,
            },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create Lemon checkout: ${text}`);
  }

  const payload = await response.json();
  const checkoutUrl = payload?.data?.attributes?.url as string | undefined;

  if (!checkoutUrl) {
    throw new Error("Lemon checkout response did not include a checkout URL.");
  }

  return checkoutUrl;
}

export function verifyLemonSignature(rawBody: string, signature: string | null) {
  if (!signature || !env.LEMON_SQUEEZY_WEBHOOK_SECRET) {
    return false;
  }

  const digest = crypto
    .createHmac("sha256", env.LEMON_SQUEEZY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  const signatureBuffer = Buffer.from(signature, "hex");
  const digestBuffer = Buffer.from(digest, "hex");

  if (signatureBuffer.length !== digestBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, digestBuffer);
}

type LemonWebhookPayload = {
  meta?: {
    event_name?: string;
    custom_data?: {
      user_id?: string;
      target_plan?: string;
    };
  };
  data?: {
    id?: string;
    attributes?: {
      customer_id?: number | string | null;
      order_id?: number | string | null;
      variant_id?: number | string | null;
      status?: string | null;
      user_email?: string | null;
    };
  };
};

export async function syncPlanFromWebhook(payload: LemonWebhookPayload) {
  const eventName = payload.meta?.event_name;
  const customUserId = payload.meta?.custom_data?.user_id;
  const attributes = payload.data?.attributes;
  const subscriptionId = payload.data?.id ? String(payload.data.id) : null;
  const email = attributes?.user_email ?? null;

  const user =
    (customUserId
      ? await prisma.user.findUnique({ where: { id: customUserId } })
      : null) ??
    (subscriptionId
      ? await prisma.user.findFirst({
          where: { lemonsqueezySubscriptionId: subscriptionId },
        })
      : null) ??
    (email
      ? await prisma.user.findUnique({
          where: { email },
        })
      : null);

  if (!user) {
    return;
  }

  let nextPlanId: PlanId = resolvePlanId(user.planId);

  if (eventName === "subscription_created" || eventName === "subscription_resumed") {
    nextPlanId = "pro";
  }

  if (eventName === "subscription_updated") {
    nextPlanId =
      attributes?.status === "expired" || attributes?.status === "refunded"
        ? "starter"
        : "pro";
  }

  if (eventName === "subscription_expired") {
    nextPlanId = "starter";
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      planId: nextPlanId,
      lemonsqueezyCustomerId: attributes?.customer_id
        ? String(attributes.customer_id)
        : user.lemonsqueezyCustomerId,
      lemonsqueezySubscriptionId:
        subscriptionId ?? user.lemonsqueezySubscriptionId,
      lemonsqueezyOrderId: attributes?.order_id
        ? String(attributes.order_id)
        : user.lemonsqueezyOrderId,
      lemonsqueezyVariantId: attributes?.variant_id
        ? String(attributes.variant_id)
        : user.lemonsqueezyVariantId,
      subscriptionStatus: attributes?.status ?? user.subscriptionStatus,
    },
  });
}
