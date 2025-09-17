import z from "zod";
import { Settings, PurgableModels } from "@prisma/client";
import { getRegistry } from "../../config/openApiRegistry";

const registry = getRegistry();

const settingValueSchemas = {
  ACTUAL_SCHOOL_PERIOD_ID: z.string().nullable(),
  ACTUAL_SCHOOL_MONTH_ID: z.string().nullable(),
  ACTUAL_SCHOOL_YEAR_ID: z.string().nullable(),
  AUDIT_LOG_RETENTION_DAYS: z.number().int().positive(),
  CURRENCY_SYMBOL: z.string().min(1),
  DAYS_UNTIL_OVERDUE: z.number().int().positive(),
  DB_CLEANUP_DAYS: z.number().int().positive().nullable(),
  IS_USER_REGISTRATION_ENABLED: z.boolean(),
  MINIMUM_PASSWORD_LENGTH: z.number().int().positive(),
  OVERDUE_FEE_IS_PERCENTAGE: z.boolean(),
  OVERDUE_FEE_VALUE: z.number().positive().nullable(),
  PAYMENT_DUE_DAY: z.number().int().min(1).max(31),
  SESSION_TIMEOUT_MINUTES: z.number().int().positive(),
  SOFT_DELETED_MODELS_TO_PURGE: z.array(z.enum(PurgableModels)),
  SEARCH_THRESHOLD: z.number().min(0).max(1),
  PUBLIC_REGISTRATION_ENABLED: z.boolean(),
} as const;

const getSettingSchema = (name: Settings) =>
  settingValueSchemas[name as keyof typeof settingValueSchemas];

export const SettingSchema = registry.register(
  "SettingSchema",
  z.object({
    id: z.number().positive(),
    name: z.enum(Settings),
    value: z.string(),
  })
);

export const UpsertSettingSchema = registry.register(
  "UpsertSettingSchema",
  z
    .object({
      name: z.enum(Settings),
      value: z.any(),
    })
    .superRefine((data, ctx) => {
      const schemaForValue = getSettingSchema(data.name);

      if (!schemaForValue) {
        ctx.addIssue({
          code: "custom",
          message: `No schema found for setting: ${data.name}`,
          path: ["name"],
        });
        return;
      }

      const result = schemaForValue.safeParse(data.value);

      if (!result.success) {
        result.error.issues.forEach((issue) => {
          ctx.addIssue({
            ...issue,
            path: ["value", ...issue.path],
          });
        });
      }
    })
);

// Create union schema for all possible setting responses
// Each setting name becomes a key in the response object
// Controller returns { [settingName]: settingValue }
const settingResponseSchemas = Object.values(Settings)
  .filter((setting) => setting in settingValueSchemas)
  .map((setting) =>
    z.object({ [setting]: settingValueSchemas[setting as keyof typeof settingValueSchemas] })
  );

export const GetSettingResponseSchema = registry.register(
  "GetSettingResponseSchema",
  z.union(settingResponseSchemas)
);

export const GetSettingParamsSchema = registry.register(
  "GetSettingParamsSchema",
  SettingSchema.pick({ name: true })
);
