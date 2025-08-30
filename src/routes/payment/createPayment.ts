import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { z } from "zod";
import { PaymentFeature } from "../../features/payment.feature";
import { PaymentType } from "@prisma/client";

const createPaymentSchema = z.object({
  studentId: z.number().positive(),
  periodId: z.number().positive(),
  paymentType: z.enum(PaymentType),
  amount: z.number().positive().min(0.01),
  paymentMethodId: z.number().positive(),
  reference: z.string().trim().nullable().nullish(),
  verified: z.boolean().nullable().nullish(),
});

export async function createPayment(req: Request, res: Response) {
  const {
    amount,
    paymentMethodId,
    paymentType,
    periodId,
    reference,
    studentId,
    verified,
  } = createPaymentSchema.parse(req.body);

  const paymentFeature = container.get<PaymentFeature>(TYPES.PaymentFeature);

  const payment = await paymentFeature.create(
    studentId,
    periodId,
    paymentType,
    amount,
    paymentMethodId,
    reference ?? null,
    verified ?? null
  );

  res.json({ payment });
}
