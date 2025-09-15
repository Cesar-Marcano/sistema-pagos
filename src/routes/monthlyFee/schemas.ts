import z from "zod";
import { getRegistry } from "../../config/openApiRegistry";
import { MonthlyFeeOnGrade } from "@prisma/client";

const registry = getRegistry();

export const MonthlyFeeSchema = registry.register(
  "MonthlyFeeSchema",
  z.object({
    description: z.string().trim().min(3),
    amount: z.string(),
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
    schoolMonthId: z.string().transform(Number).pipe(z.number().positive()),
  })
);

export const CreateMonthlyFeeSchema = registry.register(
  "CreateMonthlyFee",
  MonthlyFeeSchema.pick({ description: true }).and(
    z.object({ amount: z.number().positive().min(0.01) })
  )
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
    effectiveFromMonthId: z.string().optional().transform(Number),
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

export const FeeOnGradeSchema = registry.register(
  "FeeOnGradeSchema",
  z.object({
    createdAt: z.date(),
    deletedAt: z.date().nullable(),
    gradeId: z.number().positive(),
    id: z.number().positive(),
    monthlyFeeId: z.number().positive(),
    schoolMonthId: z.number().positive(),
    updatedAt: z.date(),
  })
);

export const AssignFeeToGradesSchema = registry.register(
  "AssignFeeToGradesSchema",
  FeeOnGradeSchema.pick({ monthlyFeeId: true }).extend({
    gradeIds: z.array(z.number().positive()),
    effectiveFromMonthId: z.number().positive(),
  })
);
