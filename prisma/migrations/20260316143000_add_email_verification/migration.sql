ALTER TABLE "public"."User"
ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);

CREATE TABLE "public"."EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmailVerificationToken_tokenHash_key"
ON "public"."EmailVerificationToken"("tokenHash");

CREATE INDEX "EmailVerificationToken_userId_idx"
ON "public"."EmailVerificationToken"("userId");

CREATE INDEX "EmailVerificationToken_expiresAt_idx"
ON "public"."EmailVerificationToken"("expiresAt");

ALTER TABLE "public"."EmailVerificationToken"
ADD CONSTRAINT "EmailVerificationToken_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
