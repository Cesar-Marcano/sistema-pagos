import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { MonthlyFeeFeature } from "../../features/monthlyFee.feature";
import { UnassignFeeFromGradesSchema } from "./schemas";

export async function unassignFeeFromGrades(req: Request, res: Response) {
  const { gradeIds } = UnassignFeeFromGradesSchema.parse(req.body);

  const monthlyFeeFeature = container.get<MonthlyFeeFeature>(
    TYPES.MonthlyFeeFeature
  );

  const feesOnGrades = await monthlyFeeFeature.unassignFeeFromGrades(gradeIds);

  res.json({ feesOnGrades });
}
