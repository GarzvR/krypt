import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const optionalNonEmptyString = () =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim().length === 0
        ? undefined
        : value,
    z.string().min(1).optional(),
  );

const optionalUrlString = () =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim().length === 0
        ? undefined
        : value,
    z.string().url().optional(),
  );

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    SESSION_SECRET: z.string().min(1, "SESSION_SECRET is required"),
    SECRET_ENCRYPTION_KEY: z
      .string()
      .min(1, "SECRET_ENCRYPTION_KEY is required"),
    APP_URL: optionalUrlString(),
    RESEND_API_KEY: optionalNonEmptyString(),
    RESEND_FROM_EMAIL: optionalNonEmptyString().default("onboarding@resend.dev"),
    LEMON_SQUEEZY_API_KEY: optionalNonEmptyString(),
    LEMON_SQUEEZY_STORE_ID: optionalNonEmptyString(),
    LEMON_SQUEEZY_PRO_VARIANT_ID: optionalNonEmptyString(),
    LEMON_SQUEEZY_WEBHOOK_SECRET: optionalNonEmptyString(),
    LEMON_SQUEEZY_WEBHOOK_URL: optionalUrlString(),
  },
  client: {},
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    SESSION_SECRET: process.env.SESSION_SECRET,
    SECRET_ENCRYPTION_KEY: process.env.SECRET_ENCRYPTION_KEY,
    APP_URL: process.env.APP_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    LEMON_SQUEEZY_API_KEY: process.env.LEMON_SQUEEZY_API_KEY,
    LEMON_SQUEEZY_STORE_ID: process.env.LEMON_SQUEEZY_STORE_ID,
    LEMON_SQUEEZY_PRO_VARIANT_ID: process.env.LEMON_SQUEEZY_PRO_VARIANT_ID,
    LEMON_SQUEEZY_WEBHOOK_SECRET: process.env.LEMON_SQUEEZY_WEBHOOK_SECRET,
    LEMON_SQUEEZY_WEBHOOK_URL: process.env.LEMON_SQUEEZY_WEBHOOK_URL,
  },
});
