import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { MonthlyFeeFeature } from "../../features/monthlyFee.feature";
import { AssignFeeToGradesSchema } from "./schemas";

export async function assignFeeToGrades(req: Request, res: Response) {
  const { gradeIds, monthlyFeeId, effectiveFromPeriodId } =
    AssignFeeToGradesSchema.parse(req.body);

  const monthlyFeeFeature = container.get<MonthlyFeeFeature>(
    TYPES.MonthlyFeeFeature
  );

  const feesOnGrades = await monthlyFeeFeature.assignFeeToGrades(
    gradeIds,
    monthlyFeeId,
    effectiveFromPeriodId
  );

  res.json({ feesOnGrades });
}
