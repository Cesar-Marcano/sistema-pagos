import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { DiscountFeature } from "../../features/discount.feature";
import { UpdateDiscountSchema } from "./schemas";

export async function updateDiscount(req: Request, res: Response) {
  const validatedData = UpdateDiscountSchema.parse(req.body);

  const discountFeature = container.get<DiscountFeature>(TYPES.DiscountFeature);

  const discount = await discountFeature.update(
    Number(req.params.id),
    validatedData
  );

  res.status(200).json({ discount });
}
