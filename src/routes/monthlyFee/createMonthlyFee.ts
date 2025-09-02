import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { MonthlyFeeFeature } from "../../features/monthlyFee.feature";
import { CreateMonthlyFeeSchema } from "./schemas";

export async function createMonthlyFee(req: Request, res: Response) {
  const { description, amount } = CreateMonthlyFeeSchema.parse(req.body);

  const monthlyFeeFeature = container.get<MonthlyFeeFeature>(
    TYPES.MonthlyFeeFeature
  );

  const monthlyFee = await monthlyFeeFeature.create(description, amount);

  res.status(201).json({ monthlyFee });
}
