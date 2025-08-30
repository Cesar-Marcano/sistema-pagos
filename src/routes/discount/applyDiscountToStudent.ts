import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { z } from "zod";
import { DiscountFeature } from "../../features/discount.feature";

const applyDiscountToStudentSchema = z.object({
  studentId: z.number().positive(),
  discountId: z.number().positive(),
});

export async function applyDiscountToStudent(req: Request, res: Response) {
  const { discountId, studentId } = applyDiscountToStudentSchema.parse(
    req.body
  );

  const discountFeature = container.get<DiscountFeature>(TYPES.DiscountFeature);

  const discountApplyed = await discountFeature.applyDiscountToStudent(
    discountId,
    studentId
  );

  res.json({ discountApplyed });
}
