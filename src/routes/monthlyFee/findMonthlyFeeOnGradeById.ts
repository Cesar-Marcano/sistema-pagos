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

  const id = Number(req.params.id);
  if (isNaN(id)) {
    throw createHttpError(400, "ID parameter must be a valid number");
  }

  const feeOnGrade = await monthlyFeeFeature.findMonthlyFeeOnGradeById(
    id,
    queryParams.includeDeleted
  );

  if (!feeOnGrade) {
    throw createHttpError(404, "Monthly fee on grade not found");
  }

  res.status(200).json(feeOnGrade);
}
