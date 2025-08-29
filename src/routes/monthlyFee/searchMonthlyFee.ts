import { Request, Response } from "express";
import { z } from "zod";
import { createSearchController } from "../../lib/searchController";
import { TYPES } from "../../config/types";

const monthlyFeeSearchCriteria = z.object({
  description: z.string().optional(),
  amount: z.number().optional(),
  effectiveFromPeriodId: z.number().optional(),
});

const monthlyFeeWhereMapper = (queryParams: any) => ({
  ...(queryParams.description && { description: queryParams.description }),
  ...(queryParams.amount && { amount: queryParams.amount }),
  ...(queryParams.effectiveFromPeriodId && {
    effectiveFromPeriodId: queryParams.effectiveFromPeriodId,
  }),
});

export const searchMonthlyFee = createSearchController(
  monthlyFeeSearchCriteria,
  TYPES.MonthlyFeeFeature,
  monthlyFeeWhereMapper
);
