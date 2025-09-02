import z from "zod";
import { getRegistry } from "../../config/openApiRegistry";

const registry = getRegistry();

export const MonthlyFeeSchema = registry.register(
  "MonthlyFeeSchema",
  z.object({
    description: z.string().trim().min(3),
    amount: z.number().positive(),
    createdAt: z.date(),
    deletedAt: z.date().nullable(),
    id: z.number().positive(),
    updatedAt: z.date(),
  })
);

export const GetEffectiveMonthlyFeeQueryParamsSchema = registry.register(
  "GetEffectiveMonthlyFeeQuery",
  z.object({
    gradeId: z.string().transform(Number).pipe(z.number().positive()),
    periodId: z.string().transform(Number).pipe(z.number().positive()),
  })
);

export const CreateMonthlyFeeSchema = registry.register(
  "CreateMonthlyFee",
  MonthlyFeeSchema.pick({ description: true, amount: true })
);

export const MonthlyFeeSearchCriteriaQueryParams = registry.register(
  "MonthlyFeeSearchCriteriaQuery",
  z.object({
    description: z.string().optional(),
    amount: z.string().optional().transform(Number),
  })
);

export const MonthlyFeeOnGradeSearchCriteriaQueryParams = registry.register(
  "MonthlyFeeOnGradeSearchCriteriaQuery",
  z.object({
    monthlyFeeId: z.string().optional().transform(Number),
    gradeId: z.string().optional().transform(Number),
    effectiveFromPeriodId: z.string().optional().transform(Number),
  })
);

export const UnassignFeeFromGradesSchema = registry.register(
  "UnassignFeeFromGradesSchema",
  z.object({
    gradeIds: z.array(z.number().positive()),
  })
);

export const UpdateMonthlyFeeSchema = registry.register(
  "UpdateMonthlyFeeSchema",
  z.object({
    description: z.string().trim().min(3),
  })
);
