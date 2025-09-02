import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { PaymentFeature } from "../../features/payment.feature";

export async function softDeletePayment(req: Request, res: Response) {
  const paymentFeature = container.get<PaymentFeature>(TYPES.PaymentFeature);

  const payment = await paymentFeature.softDelete(Number(req.params.id));

  res.status(200).json({ payment });
}
