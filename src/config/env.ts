import "dotenv/config";

import { z } from "zod";
import logger from "../app/logger";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform(Number).default(3000),
  JWT_SECRET: z.string().min(1),
  DATABASE_URL: z.url(),
});

type EnvSchema = z.infer<typeof envSchema>;

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvSchema {}
  }
}

try {
  envSchema.parse(process.env);
} catch (error) {
  logger.error(error);
  process.exit(1);
}
