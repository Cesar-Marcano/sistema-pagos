import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { DiscountFeature } from "../../features/discount.feature";

export async function unapplyDiscountFromStudent(req: Request, res: Response) {
  const discountFeature = container.get<DiscountFeature>(TYPES.DiscountFeature);

  const discountUnapplied = await discountFeature.unapplyDiscountFromStudent(
    Number(req.params.id)
  );

  res.status(200).json({ discountUnapplied });
}
