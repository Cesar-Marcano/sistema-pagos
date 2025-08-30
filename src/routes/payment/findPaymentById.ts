import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import z from "zod";
import createHttpError from "http-errors";
import { PaymentFeature } from "../../features/payment.feature";

const paramsSchema = z.object({
  includeDeleted: z
    .string()
    .optional()
    .transform((val) => val === "true")
    .default(false),
});

export async function findPaymentById(req: Request, res: Response) {
  const paymentFeature = container.get<PaymentFeature>(
    TYPES.PaymentFeature
  );

  const queryParams = paramsSchema.parse(req.query);

  const payment = await paymentFeature.findById(
    Number(req.params.id),
    queryParams.includeDeleted
  );

  if (!payment) throw createHttpError(404, "Pago no encontrado.");

  res.json({ payment });
}
