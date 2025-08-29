import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { GradeFeature } from "../../features/grade.feature";
import { MonthlyFeeFeature } from "../../features/monthlyFee.feature";

export async function softDeleteMonthlyFee(req: Request, res: Response) {
  const monthlyFeeFeature = container.get<MonthlyFeeFeature>(TYPES.MonthlyFeeFeature);

  const monthlyFee = await monthlyFeeFeature.softDelete(Number(req.params.id));

  res.json({ monthlyFee });
}
