import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { PaymentMethodFeature } from "../../features/paymentMethod.feature";

export async function softDeletePaymentMethod(req: Request, res: Response) {
  const paymentMethodFeature = container.get<PaymentMethodFeature>(
    TYPES.PaymentMethodFeature
  );

  const paymentMethod = await paymentMethodFeature.softDelete(
    Number(req.params.id)
  );

  res.status(200).json({ paymentMethod });
}
