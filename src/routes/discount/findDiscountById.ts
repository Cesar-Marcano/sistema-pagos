import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import createHttpError from "http-errors";
import { DiscountFeature } from "../../features/discount.feature";
import { FindByIdParamsSchema } from "../../lib/findByIdParamsSchema";

export async function findDiscountById(req: Request, res: Response) {
  const discountFeature = container.get<DiscountFeature>(TYPES.DiscountFeature);

  const queryParams = FindByIdParamsSchema.parse(req.query);

  const discount = await discountFeature.findById(
    Number(req.params.id),
    queryParams.includeDeleted
  );

  if (!discount) throw createHttpError(404, "Descuento no encontrado.");

  res.status(200).json({ discount });
}
