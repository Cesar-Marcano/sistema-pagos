import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { z } from "zod";
import { PaymentFeature } from "../../features/payment.feature";

const updatePaymentSchema = z.object({
  reference: z.string().trim().optional(),
  verified: z.boolean().optional(),
});

export async function updatePayment(req: Request, res: Response) {
  const validatedData = updatePaymentSchema.parse(req.body);

  const paymentFeature = container.get<PaymentFeature>(TYPES.PaymentFeature);

  const payment = await paymentFeature.update(
    Number(req.params.id),
    validatedData
  );

  res.json({ payment });
}
