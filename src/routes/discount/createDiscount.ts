import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { DiscountFeature } from "../../features/discount.feature";
import { CreateDiscountSchema } from "./schemas";

export async function createDiscount(req: Request, res: Response) {
  const { name, description, amount, isPercentage } =
    CreateDiscountSchema.parse(req.body);

  const discountFeature = container.get<DiscountFeature>(TYPES.DiscountFeature);

  const discount = await discountFeature.create(
    name,
    description,
    amount,
    isPercentage
  );

  res.status(201).json({ discount });
}
