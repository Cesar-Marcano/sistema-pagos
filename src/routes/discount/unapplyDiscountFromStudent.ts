import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { DiscountFeature } from "../../features/discount.feature";

export async function unapplyDiscountFromStudent(req: Request, res: Response) {
  const discountFeature = container.get<DiscountFeature>(TYPES.DiscountFeature);

  const discountUnapplyed = await discountFeature.unapplyDiscountFromStudent(
    Number(req.params.id)
  );

  res.json({ discountUnapplyed });
}
