import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { z } from "zod";
import { MonthlyFeeFeature } from "../../features/monthlyFee.feature";

const assignFeeToGradesSchema = z.object({
  gradeIds: z.array(z.number().positive()),
  monthlyFeeId: z.number().positive(),
  effectiveFromPeriodId: z.number().positive(),
});

export async function assignFeeToGrades(req: Request, res: Response) {
  const { gradeIds, monthlyFeeId, effectiveFromPeriodId } =
    assignFeeToGradesSchema.parse(req.body);

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
