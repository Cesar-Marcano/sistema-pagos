import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { z } from "zod";
import { PaymentMethodFeature } from "../../features/paymentMethod.feature";

const updatePaymentMethodSchema = z.object({
  name: z.string().trim().toUpperCase().min(3),
});

export async function updatePaymentMethod(req: Request, res: Response) {
  const validatedData = updatePaymentMethodSchema.parse(req.body);

  const paymentMethodFeature = container.get<PaymentMethodFeature>(
    TYPES.PaymentMethodFeature
  );

  const paymentMethod = await paymentMethodFeature.update(
    Number(req.params.id),
    validatedData.name
  );

  res.json({ paymentMethod });
}
