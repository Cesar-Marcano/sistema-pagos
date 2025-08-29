import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { z } from "zod";
import { DiscountFeature } from "../../features/discount.feature";

const createDiscountSchema = z.object({
  name: z.string().trim().min(3),
  description: z.string().trim().min(3),
  amount: z.number().positive(),
  isPercentage: z.boolean().default(true),
});

export async function createDiscount(req: Request, res: Response) {
  const { name, description, amount, isPercentage } =
    createDiscountSchema.parse(req.body);

  const discountFeature = container.get<DiscountFeature>(TYPES.DiscountFeature);

  const discount = await discountFeature.create(
    name,
    description,
    amount,
    isPercentage
  );

  res.json({ discount });
}
