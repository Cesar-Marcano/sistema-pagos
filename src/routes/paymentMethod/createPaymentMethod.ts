import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { z } from "zod";
import { PaymentMethodFeature } from "../../features/paymentMethod.feature";

const createGradeSchema = z.object({
  name: z.string().trim().toUpperCase().min(3),
  requiresManualVerification: z.boolean(),
  requiresReferenceId: z.boolean(),
});

export async function createPaymentMethod(req: Request, res: Response) {
  const { name, requiresManualVerification, requiresReferenceId } =
    createGradeSchema.parse(req.body);

  const paymentMethodFeature = container.get<PaymentMethodFeature>(
    TYPES.PaymentMethodFeature
  );

  const paymentMethod = await paymentMethodFeature.create(
    name,
    requiresManualVerification,
    requiresReferenceId
  );

  res.json({ paymentMethod });
}
