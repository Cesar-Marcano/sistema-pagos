import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { PaymentFeature } from "../../features/payment.feature";
import { UpdatePaymentSchema } from "./schemas";

export async function updatePayment(req: Request, res: Response) {
  const validatedData = UpdatePaymentSchema.parse(req.body);

  const paymentFeature = container.get<PaymentFeature>(TYPES.PaymentFeature);

  const payment = await paymentFeature.update(
    Number(req.params.id),
    validatedData
  );

  res.status(200).json({ payment });
}
