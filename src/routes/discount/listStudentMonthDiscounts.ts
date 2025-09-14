import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { DiscountFeature } from "../../features/discount.feature";

export async function listStudentMonthDiscounts(req: Request, res: Response) {
  const discountFeature = container.get<DiscountFeature>(TYPES.DiscountFeature);

  const studentMonthDiscounts = await discountFeature.listStudentMonthDiscounts(
    Number(req.params.studentId),
    Number(req.params.schoolMonthId)
  );

  res.status(200).json({ studentMonthDiscounts });
}
