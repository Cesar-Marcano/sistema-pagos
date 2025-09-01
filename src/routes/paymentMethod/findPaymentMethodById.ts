import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import createHttpError from "http-errors";
import { PaymentMethodFeature } from "../../features/paymentMethod.feature";
import { FindByIdParamsSchema } from "../../lib/findByIdParamsSchema";

export async function findPaymentMethodById(req: Request, res: Response) {
  const paymentMethodFeature = container.get<PaymentMethodFeature>(
    TYPES.PaymentMethodFeature
  );

  const queryParams = FindByIdParamsSchema.parse(req.query);

  const paymentMethod = await paymentMethodFeature.findById(
    Number(req.params.id),
    queryParams.includeDeleted
  );

  if (!paymentMethod) throw createHttpError(404, "Metodo de pago no encontrado.");

  res.status(200).json({ paymentMethod });
}
