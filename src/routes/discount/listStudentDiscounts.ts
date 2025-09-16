import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { DiscountFeature } from "../../features/discount.feature";
import { z } from "zod";

export async function listStudentDiscounts(req: Request, res: Response) {
  const discountFeature = container.get<DiscountFeature>(TYPES.DiscountFeature);

  const { id } = z
    .object({
      id: z.string().transform(Number).pipe(z.number()),
    })
    .parse(req.params);

  const studentDiscounts = await discountFeature.listStudentDiscounts(id);

  res.status(200).json({ studentDiscounts });
}
