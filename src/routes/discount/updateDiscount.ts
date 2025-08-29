import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { z } from "zod";
import { DiscountFeature } from "../../features/discount.feature";

const updateDiscountSchema = z.object({
  name: z.string().trim().min(3).optional(),
  description: z.string().trim().min(3).optional(),
  amount: z.number().positive().optional(),
  isPercentage: z.boolean().optional(),
});

export async function updateDiscount(req: Request, res: Response) {
  const validatedData = updateDiscountSchema.parse(req.body);

  const discountFeature = container.get<DiscountFeature>(TYPES.DiscountFeature);

  const discount = await discountFeature.update(
    Number(req.params.id),
    validatedData
  );

  res.json({ discount });
}
