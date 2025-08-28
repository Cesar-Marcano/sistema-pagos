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
  TOKEN_LIFETIME: z.string().default("4h"),
  TOKEN_ISSUER: z.string().default("sistema-pagos-estudiantiles"),
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
