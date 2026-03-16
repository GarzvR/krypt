ALTER TABLE "public"."User"
ADD COLUMN "planId" TEXT NOT NULL DEFAULT 'starter',
ADD COLUMN "lemonsqueezyCustomerId" TEXT,
ADD COLUMN "lemonsqueezySubscriptionId" TEXT,
ADD COLUMN "lemonsqueezyOrderId" TEXT,
ADD COLUMN "lemonsqueezyVariantId" TEXT,
ADD COLUMN "subscriptionStatus" TEXT;

CREATE UNIQUE INDEX "User_lemonsqueezyCustomerId_key"
ON "public"."User"("lemonsqueezyCustomerId");

CREATE UNIQUE INDEX "User_lemonsqueezySubscriptionId_key"
ON "public"."User"("lemonsqueezySubscriptionId");
