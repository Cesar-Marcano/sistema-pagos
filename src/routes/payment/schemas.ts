import z from "zod";
import { getRegistry } from "../../config/openApiRegistry";
import { PaymentTags } from "@prisma/client";

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
    schoolMonthId: z.number().positive(),
    studentId: z.number().positive(),
    reference: ReferenceSchema.nullable().nullish(),
    verified: VerifiedSchema.nullable().nullish(),
    paymentTags: z.array(z.enum(PaymentTags)),
    paidAt: z.date(),
  })
);

export const CreatePaymentSchema = registry.register(
  "CreatePaymentSchema",
  PaymentSchema.pick({
    studentId: true,
    schoolMonthId: true,
    amount: true,
    paymentMethodId: true,
    reference: true,
    verified: true,
  }).and(
    z.object({
      paidAt: z.string().transform((val) => new Date(val)),
      isRefund: z.boolean().optional().default(false),
    })
  )
);

export const PaymentSearchCriteriaQueryParamsSchema = registry.register(
  "PaymentSearchCriteriaQuery",
  z.object({
    studentId: z.string().transform(Number).optional(),
    schoolMonthId: z.string().transform(Number).optional(),
    paymentTags: z.array(z.enum(PaymentTags)).optional(),
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
    paidAt: z.string().transform((val) => new Date(val)).optional(),
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
