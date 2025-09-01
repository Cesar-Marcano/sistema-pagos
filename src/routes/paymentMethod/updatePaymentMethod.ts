import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { PaymentMethodFeature } from "../../features/paymentMethod.feature";
import { UpdatePaymentMethodSchema } from "./schemas";

export async function updatePaymentMethod(req: Request, res: Response) {
  const validatedData = UpdatePaymentMethodSchema.parse(req.body);

  const paymentMethodFeature = container.get<PaymentMethodFeature>(
    TYPES.PaymentMethodFeature
  );

  const paymentMethod = await paymentMethodFeature.update(
    Number(req.params.id),
    validatedData.name
  );

  res.json({ paymentMethod });
}
