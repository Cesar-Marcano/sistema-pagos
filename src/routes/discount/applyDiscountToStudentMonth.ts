import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { DiscountFeature } from "../../features/discount.feature";
import { ApplyDiscountToStudentMonthSchema } from "./schemas";

export async function applyDiscountToStudentMonth(
  req: Request,
  res: Response
) {
  const { discountId, schoolMonthId, studentId } =
    ApplyDiscountToStudentMonthSchema.parse(req.body);

  const discountFeature = container.get<DiscountFeature>(TYPES.DiscountFeature);

  const discountApplied = await discountFeature.applyDiscountToStudentMonth(
    discountId,
    schoolMonthId,
    studentId
  );

  res.status(201).json({ discountApplied });
}
