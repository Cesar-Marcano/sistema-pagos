import z from "zod";
import { getRegistry } from "../../config/openApiRegistry";

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

export const CreatePaymentMethodSchema = registry.register(
  "CreatePaymentMethodSchema",
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
      .transform((val) => {
        if (val === undefined) return undefined;
        if (val === "true") return true;
        if (val === "false") return false;
        return undefined;
      }),
    requiresReferenceId: z
      .string()
      .optional()
      .transform((val) => {
        if (val === undefined) return undefined;
        if (val === "true") return true;
        if (val === "false") return false;
        return undefined;
      }),
  })
);

export const UpdatePaymentMethodSchema = registry.register(
  "UpdatePaymentMethodSchema",
  CreatePaymentMethodSchema.pick({ name: true })
);
