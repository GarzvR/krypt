import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    SESSION_SECRET: z.string().min(1, "SESSION_SECRET is required"),
    SECRET_ENCRYPTION_KEY: z.string().min(1, "SECRET_ENCRYPTION_KEY is required"),
  },
  client: {
    // Client envs go here if needed later (e.g. NEXT_PUBLIC_API_URL)
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    SESSION_SECRET: process.env.SESSION_SECRET,
    SECRET_ENCRYPTION_KEY: process.env.SECRET_ENCRYPTION_KEY,
  },
});
