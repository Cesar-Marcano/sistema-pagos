import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import createHttpError from "http-errors";
import { MonthlyFeeFeature } from "../../features/monthlyFee.feature";
import { FindByIdParamsSchema } from "../../lib/findByIdParamsSchema";

export async function findMonthlyFeeById(req: Request, res: Response) {
  const monthlyFeeFeature = container.get<MonthlyFeeFeature>(
    TYPES.MonthlyFeeFeature
  );

  const queryParams = FindByIdParamsSchema.parse(req.query);

  const monthlyFee = await monthlyFeeFeature.findById(
    Number(req.params.id),
    queryParams.includeDeleted
  );

  if (!monthlyFee) throw createHttpError(404, "Mensualidad no encontrada.");

  res.json({ monthlyFee });
}
