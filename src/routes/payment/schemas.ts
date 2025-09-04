import z from "zod";
import { getRegistry } from "../../config/openApiRegistry";
import { PaymentType } from "@prisma/client";

const registry = getRegistry();

const ReferenceSchema = z.string().trim();
const VerifiedSchema = z.boolean();

export const PaymentSchema = registry.register(
  "PaymentSchema",
  z.object({
    amount: z.number().positive().min(0.01),
    createdAt: z.date(),
    deletedAt: z.date().nullable(),
    id: z.number(),
    paymentMethodId: z.number().positive(),
    updatedAt: z.number(),
    schoolPeriodId: z.number().positive(),
    studentId: z.number().positive(),
    reference: ReferenceSchema.nullable().nullish(),
    verified: VerifiedSchema.nullable().nullish(),
    paymentType: z.enum(PaymentType),
  })
);

export const CreatePaymentSchema = registry.register(
  "CreatePaymentSchema",
  PaymentSchema.pick({
    studentId: true,
    schoolPeriodId: true,
    amount: true,
    paymentMethodId: true,
    reference: true,
    verified: true,
  }).and(
    z.object({
      paymentType: z.enum(["OVERDUE", "REFUND"]).nullable(),
    })
  )
);

export const PaymentSearchCriteriaQueryParamsSchema = registry.register(
  "PaymentSearchCriteriaQuery",
  z.object({
    studentId: z.string().transform(Number).optional(),
    schoolPeriodId: z.string().transform(Number).optional(),
    paymentType: z.enum(PaymentType).optional(),
    amount: z.string().transform(Number).optional(),
    paymentMethodId: z.string().transform(Number).optional(),
    reference: z
      .string()
      .trim()
      .optional()
      .nullable()
      .or(z.literal("").transform(() => null)),
    verified: z
      .string()
      .transform((val) => val === "true")
      .optional(),
  })
);

export const UpdatePaymentSchema = registry.register(
  "UpdatePaymentSchema",
  z
    .object({
      reference: ReferenceSchema,
      verified: VerifiedSchema,
    })
    .partial()
);
