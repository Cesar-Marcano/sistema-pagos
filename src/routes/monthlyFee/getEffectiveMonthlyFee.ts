import { Request, Response } from "express";
import { container } from "../../config/container";
import { MonthlyFeeFeature } from "../../features/monthlyFee.feature";
import { TYPES } from "../../config/types";
import { GetEffectiveMonthlyFeeQueryParamsSchema } from "./schemas";

export async function getEffectiveMonthlyFee(req: Request, res: Response) {
  const monthlyFeeFeature = container.get<MonthlyFeeFeature>(
    TYPES.MonthlyFeeFeature
  );

  const { gradeId, schoolMonthId } = GetEffectiveMonthlyFeeQueryParamsSchema.parse(
    req.query
  );

  const effectiveMonthlyFee = await monthlyFeeFeature.getEffectiveMonthlyFee(
    gradeId,
    schoolMonthId
  );

  res.status(200).json({ effectiveMonthlyFee });
}
