import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { PaymentMethodFeature } from "../../features/paymentMethod.feature";
import { CreatePaymentMethodSchema } from "./schemas";

export async function createPaymentMethod(req: Request, res: Response) {
  const { name, requiresManualVerification, requiresReferenceId } =
    CreatePaymentMethodSchema.parse(req.body);

  const paymentMethodFeature = container.get<PaymentMethodFeature>(
    TYPES.PaymentMethodFeature
  );

  const paymentMethod = await paymentMethodFeature.create(
    name,
    requiresManualVerification,
    requiresReferenceId
  );

  res.status(201).json({ paymentMethod });
}
