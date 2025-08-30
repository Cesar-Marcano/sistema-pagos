import { Request, Response } from "express";
import { z } from "zod";
import { createSearchController } from "../../lib/searchController";
import { TYPES } from "../../config/types";

const discountSearchCriteria = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  amount: z.string().optional().transform(Number),
  isPercentage: z
    .string()
    .optional()
    .transform((val) => val === "true"),
});

const discountWhereMapper = (queryParams: any) => ({
  ...(queryParams.name && { name: queryParams.name }),
  ...(queryParams.description && { description: queryParams.description }),
  ...(queryParams.amount && { amount: queryParams.amount }),
  ...(queryParams.isPercentage && { isPercentage: queryParams.isPercentage }),
});

export const searchDiscount = createSearchController(
  discountSearchCriteria,
  TYPES.DiscountFeature,
  discountWhereMapper
);
