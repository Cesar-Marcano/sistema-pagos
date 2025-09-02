import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import createHttpError from "http-errors";
import { MonthlyFeeFeature } from "../../features/monthlyFee.feature";
import { FindByIdParamsSchema } from "../../lib/findByIdParamsSchema";

export async function findMonthlyFeeOnGradeById(req: Request, res: Response) {
  const monthlyFeeFeature = container.get<MonthlyFeeFeature>(
    TYPES.MonthlyFeeFeature
  );

  const queryParams = FindByIdParamsSchema.parse(req.query);

  const feeOnGrade = await monthlyFeeFeature.findMonthlyFeeOnGradeById(
    Number(req.params.id),
    queryParams.includeDeleted
  );

  if (!feeOnGrade)
    throw createHttpError(404, "Mensualidad asignada no encontrada.");

  res.json({ feeOnGrade });
}
