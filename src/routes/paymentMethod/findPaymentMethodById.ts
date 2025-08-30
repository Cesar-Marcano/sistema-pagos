import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import z from "zod";
import createHttpError from "http-errors";
import { PaymentMethodFeature } from "../../features/paymentMethod.feature";

const paramsSchema = z.object({
  includeDeleted: z
    .string()
    .optional()
    .transform((val) => val === "true")
    .default(false),
});

export async function findPaymentMethodById(req: Request, res: Response) {
  const paymentMethodFeature = container.get<PaymentMethodFeature>(
    TYPES.PaymentMethodFeature
  );

  const queryParams = paramsSchema.parse(req.query);

  const paymentMethod = await paymentMethodFeature.findById(
    Number(req.params.id),
    queryParams.includeDeleted
  );

  if (!paymentMethod) throw createHttpError(404, "Metodo de pago no encontrado.");

  res.json({ paymentMethod });
}
