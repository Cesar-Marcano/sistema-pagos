import "dotenv/config";

import { z } from "zod";
import ms, { StringValue } from "ms";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform(Number).default(3000),
  JWT_SECRET: z.string().min(1),
  DATABASE_URL: z.url(),
  TOKEN_LIFETIME: z
    .string()
    .refine(
      (val) => typeof val === "string" && ms(val as StringValue) !== undefined,
      {
        message:
          "TOKEN_LIFETIME debe ser un formato de tiempo válido (ej. 1h, 30m, 5d).",
      }
    )
    .default("4h"),

  TOKEN_ISSUER: z.string().default("sistema-pagos-estudiantiles"),
});

export const env = envSchema.parse(process.env);
