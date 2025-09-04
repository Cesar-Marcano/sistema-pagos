import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { DiscountFeature } from "../../features/discount.feature";
import { ApplyDiscountToStudentSchema } from "./schemas";



export async function applyDiscountToStudent(req: Request, res: Response) {
  const { discountId, studentId } = ApplyDiscountToStudentSchema.parse(
    req.body
  );

  const discountFeature = container.get<DiscountFeature>(TYPES.DiscountFeature);

  const discountApplied = await discountFeature.applyDiscountToStudent(
    discountId,
    studentId
  );

  res.status(201).json({ discountApplied });
}
