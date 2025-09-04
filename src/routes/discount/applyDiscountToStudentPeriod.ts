import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { DiscountFeature } from "../../features/discount.feature";
import { ApplyDiscountToStudentPeriodSchema } from "./schemas";

export async function applyDiscountToStudentPeriod(
  req: Request,
  res: Response
) {
  const { discountId, schoolPeriodId, studentId } =
    ApplyDiscountToStudentPeriodSchema.parse(req.body);

  const discountFeature = container.get<DiscountFeature>(TYPES.DiscountFeature);

  const discountApplied = await discountFeature.applyDiscountToStudentPeriod(
    discountId,
    schoolPeriodId,
    studentId
  );

  res.status(201).json({ discountApplied });
}
