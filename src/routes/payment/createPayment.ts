import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { PaymentFeature } from "../../features/payment.feature";
import { CreatePaymentSchema } from "./schemas";

export async function createPayment(req: Request, res: Response) {
  const {
    amount,
    paymentMethodId,
    paymentType,
    schoolMonthId,
    reference,
    studentId,
    verified,
  } = CreatePaymentSchema.parse(req.body);

  const paymentFeature = container.get<PaymentFeature>(TYPES.PaymentFeature);

  const payment = await paymentFeature.create(
    studentId,
    schoolMonthId,
    paymentType,
    amount,
    paymentMethodId,
    reference ?? null,
    verified ?? null
  );

  res.status(201).json({ payment });
}
