import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import z from "zod";
import createHttpError from "http-errors";
import { DiscountFeature } from "../../features/discount.feature";

const paramsSchema = z.object({
  includeDeleted: z
    .string()
    .optional()
    .transform((val) => val === "true")
    .default(false),
});

export async function findDiscountById(req: Request, res: Response) {
  const discountFeature = container.get<DiscountFeature>(
    TYPES.DiscountFeature
  );

  const queryParams = paramsSchema.parse(req.query);

  const discount = await discountFeature.findById(
    Number(req.params.id),
    queryParams.includeDeleted
  );

  if (!discount) throw createHttpError(404, "Descuento no encontrado.");

  res.json({ discount });
}
