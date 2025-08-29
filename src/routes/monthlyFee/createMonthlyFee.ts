import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { z } from "zod";
import { MonthlyFeeFeature } from "../../features/monthlyFee.feature";

const createMonthlyFeeSchema = z.object({
  description: z.string().trim().min(3),
  amount: z.number().positive(),
});

export async function createMonthlyFee(req: Request, res: Response) {
  const { description, amount } = createMonthlyFeeSchema.parse(req.body);

  const monthlyFeeFeature = container.get<MonthlyFeeFeature>(
    TYPES.MonthlyFeeFeature
  );

  const monthlyFee = await monthlyFeeFeature.create(description, amount);

  res.json({ monthlyFee });
}
