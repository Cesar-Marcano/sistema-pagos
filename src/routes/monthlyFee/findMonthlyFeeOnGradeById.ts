import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import z from "zod";
import createHttpError from "http-errors";
import { MonthlyFeeFeature } from "../../features/monthlyFee.feature";

const paramsSchema = z.object({
  includeDeleted: z
    .string()
    .optional()
    .transform((val) => val === "true")
    .default(false),
});

export async function findMonthlyFeeOnGradeById(req: Request, res: Response) {
  const monthlyFeeFeature = container.get<MonthlyFeeFeature>(
    TYPES.MonthlyFeeFeature
  );

  const queryParams = paramsSchema.parse(req.query);

  const feeOnGrade = await monthlyFeeFeature.findMonthlyFeeOnGradeById(
    Number(req.params.id),
    queryParams.includeDeleted
  );

  if (!feeOnGrade)
    throw createHttpError(404, "Mensualidad asignada no encontrada.");

  res.json({ feeOnGrade });
}
