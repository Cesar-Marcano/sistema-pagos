import z from "zod";
import { getRegistry } from "../../config/openApiRegistry";
import { PaymentMethod } from "@prisma/client";

const registry = getRegistry();

export const PaymentMethodSchema = registry.register(
  "PaymentMethodSchema",
  z.object({
    name: z.string().trim().toUpperCase().min(3),
    requiresManualVerification: z.boolean(),
    requiresReferenceId: z.boolean(),
    createdAt: z.date(),
    deletedAt: z.date().nullable(),
    id: z.number().positive(),
    updatedAt: z.date(),
  })
);

export const CreatePaymentMethodSchemea = registry.register(
  "CreatePaymentMethodSchmea",
  PaymentMethodSchema.pick({
    name: true,
    requiresManualVerification: true,
    requiresReferenceId: true,
  })
);

export const PaymentMethodSearchCriteriaQueryParams = registry.register(
  "PaymentMethodSearchCriteriaQuery",
  z.object({
    name: z.string().optional(),
    requiresManualVerification: z
      .string()
      .optional()
      .transform((val) => val === "true")
      .default(false),
    requiresReferenceId: z
      .string()
      .optional()
      .transform((val) => val === "true")
      .default(false),
  })
);

export const UpdatePaymentMethodSchema = registry.register(
  "UpdatePaymentMethodSchema",
  CreatePaymentMethodSchemea.pick({ name: true })
);
