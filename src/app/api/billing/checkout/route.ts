import { createProCheckout } from "@/lib/billing";
import { getSessionUserId } from "@/lib/auth/session";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function resolveAppOrigin(requestUrl: string) {
  if (env.LEMON_SQUEEZY_WEBHOOK_URL) {
    return new URL(env.LEMON_SQUEEZY_WEBHOOK_URL).origin;
  }

  return new URL(requestUrl).origin;
}

export async function GET(request: Request) {
  const sessionUserId = getSessionUserId();
  const appOrigin = resolveAppOrigin(request.url);

  if (!sessionUserId) {
    return NextResponse.redirect(new URL("/sign-in", appOrigin));
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUserId },
    select: { id: true, email: true },
  });

  if (!user) {
    return NextResponse.redirect(new URL("/sign-in", appOrigin));
  }

  try {
    const checkoutUrl = await createProCheckout({
      userId: user.id,
      email: user.email,
      successUrl: new URL("/settings?billing=success", appOrigin).toString(),
    });

    return NextResponse.redirect(checkoutUrl);
  } catch (error) {
    console.error("Checkout creation failed:", error);
    return NextResponse.redirect(
      new URL("/settings?billing=checkout-error", appOrigin),
    );
  }
}
