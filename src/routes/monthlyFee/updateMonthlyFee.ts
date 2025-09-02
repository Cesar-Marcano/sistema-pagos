import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { MonthlyFeeFeature } from "../../features/monthlyFee.feature";
import { UpdateMonthlyFeeSchema } from "./schemas";

export async function updateMonthlyFee(req: Request, res: Response) {
  const validatedData = UpdateMonthlyFeeSchema.parse(req.body);

  const monthlyFeeFeature = container.get<MonthlyFeeFeature>(
    TYPES.MonthlyFeeFeature
  );

  const monthlyFee = await monthlyFeeFeature.update(
    Number(req.params.id),
    validatedData.description
  );

  res.json({ monthlyFee });
}
