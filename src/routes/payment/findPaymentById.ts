import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import createHttpError from "http-errors";
import { PaymentFeature } from "../../features/payment.feature";
import { FindByIdParamsSchema } from "../../lib/findByIdParamsSchema";

export async function findPaymentById(req: Request, res: Response) {
  const paymentFeature = container.get<PaymentFeature>(
    TYPES.PaymentFeature
  );

  const queryParams = FindByIdParamsSchema.parse(req.query);

  const payment = await paymentFeature.findById(
    Number(req.params.id),
    queryParams.includeDeleted
  );

  if (!payment) throw createHttpError(404, "Pago no encontrado.");

  res.json({ payment });
}
