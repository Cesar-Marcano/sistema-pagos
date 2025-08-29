import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { z } from "zod";
import { MonthlyFeeFeature } from "../../features/monthlyFee.feature";

const updateMonthlyFeeSchema = z.object({
  description: z.string().trim().min(3),
});

export async function updateMonthlyFee(req: Request, res: Response) {
  const validatedData = updateMonthlyFeeSchema.parse(req.body);

  const monthlyFeeFeature = container.get<MonthlyFeeFeature>(
    TYPES.MonthlyFeeFeature
  );

  const monthlyFee = await monthlyFeeFeature.update(
    Number(req.params.id),
    validatedData.description
  );

  res.json({ monthlyFee });
}
