import { Request, Response } from "express";
import { z } from "zod";
import { createSearchController } from "../../lib/searchController";
import { TYPES } from "../../config/types";

const paymentMethodSearchCriteria = z.object({
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
});

const paymentMethodWhereMapper = (queryParams: any) => ({
  ...(queryParams.name && { name: queryParams.name }),
  ...(queryParams.requiresManualVerification !== undefined && {
    requiresManualVerification: queryParams.requiresManualVerification,
  }),
  ...(queryParams.requiresReferenceId !== undefined && {
    requiresReferenceId: queryParams.requiresReferenceId,
  }),
});

export const searchPaymentMethod = createSearchController(
  paymentMethodSearchCriteria,
  TYPES.PaymentMethodFeature,
  paymentMethodWhereMapper
);
