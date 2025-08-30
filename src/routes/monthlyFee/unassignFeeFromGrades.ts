import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { z } from "zod";
import { MonthlyFeeFeature } from "../../features/monthlyFee.feature";

const unassignFeeFromGradesSchema = z.object({
  gradeIds: z.array(z.number().positive()),
});

export async function unassignFeeFromGrades(req: Request, res: Response) {
  const { gradeIds } = unassignFeeFromGradesSchema.parse(req.body);

  const monthlyFeeFeature = container.get<MonthlyFeeFeature>(
    TYPES.MonthlyFeeFeature
  );

  const feesOnGrades = await monthlyFeeFeature.unassignFeeFromGrades(gradeIds);

  res.json({ feesOnGrades });
}
