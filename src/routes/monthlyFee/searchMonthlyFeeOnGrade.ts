import { Request, Response } from "express";
import { z } from "zod";
import { createSearchController } from "../../lib/searchController";
import { TYPES } from "../../config/types";

const monthlyFeeOnGradeSearchCriteria = z.object({
  monthlyFeeId: z.string().optional().transform(Number),
  gradeId: z.string().optional().transform(Number),
  effectiveFromPeriodId: z.string().optional().transform(Number),
});

const monthlyFeeOnGradeWhereMapper = (queryParams: any) => ({
  ...(queryParams.monthlyFeeId && { monthlyFeeId: queryParams.monthlyFeeId }),
  ...(queryParams.gradeId && { gradeId: queryParams.gradeId }),
  ...(queryParams.effectiveFromPeriodId && {
    effectiveFromPeriodId: queryParams.effectiveFromPeriodId,
  }),
});

export const searchMonthlyFeeOnGrade = createSearchController(
  monthlyFeeOnGradeSearchCriteria,
  TYPES.MonthlyFeeFeature,
  monthlyFeeOnGradeWhereMapper,
  {
    searchMethodName: "searchMonthlyFeeOnGrade",
  }
);
