import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { z } from "zod";
import { DiscountFeature } from "../../features/discount.feature";

const applyDiscountToStudentPeriodSchema = z.object({
  discountId: z.number().positive(),
  periodId: z.number().positive(),
  studentId: z.number().positive(),
});

export async function applyDiscountToStudentPeriod(
  req: Request,
  res: Response
) {
  const { discountId, periodId, studentId } =
    applyDiscountToStudentPeriodSchema.parse(req.body);

  const discountFeature = container.get<DiscountFeature>(TYPES.DiscountFeature);

  const discountApplied = await discountFeature.applyDiscountToStudentPeriod(
    discountId,
    periodId,
    studentId
  );

  res.json({ discountApplied });
}
