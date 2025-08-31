import { Request, Response } from "express";
import { z } from "zod";
import { createSearchController } from "../../lib/searchController";
import { TYPES } from "../../config/types";
import { PaymentType } from "@prisma/client";

const paymentSearchCriteria = z.object({
  studentId: z.string().transform(Number).optional(),
  schoolPeriodId: z.string().transform(Number).optional(),
  paymentType: z.enum(PaymentType).optional(),
  amount: z.string().transform(Number).optional(),
  paymentMethodId: z.string().transform(Number).optional(),
  reference: z
    .string()
    .trim()
    .transform((val) => (val === "null" ? null : val))
    .optional()
    .nullable(),
  verified: z
    .string()
    .transform((val) => (val === "null" ? null : val))
    .optional()
    .nullable()
    .transform((val) => (val === "true" ? true : false)),
});

const paymentWhereMapper = (queryParams: any) => ({
  ...(queryParams.studentId && { studentId: queryParams.studentId }),
  ...(queryParams.schoolPeriodId && { schoolPeriodId: queryParams.schoolPeriodId }),
  ...(queryParams.paymentType && { paymentType: queryParams.paymentType }),
  ...(queryParams.amount && { amount: queryParams.amount }),
  ...(queryParams.paymentMethodId && {
    paymentMethodId: queryParams.paymentMethodId,
  }),
  ...(queryParams.reference !== undefined && {
    reference: queryParams.reference,
  }),
  ...(queryParams.verified !== undefined && { verified: queryParams.verified }),
});

export const searchPayment = createSearchController(
  paymentSearchCriteria,
  TYPES.PaymentFeature,
  paymentWhereMapper,
  {
    searchResultName: "payments",
  }
);
