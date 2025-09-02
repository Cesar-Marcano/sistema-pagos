import { Request, Response } from "express";
import { createSearchController } from "../../lib/searchController";
import { TYPES } from "../../config/types";
import { MonthlyFeeOnGradeSearchCriteriaQueryParams } from "./schemas";

const monthlyFeeOnGradeWhereMapper = (queryParams: any) => ({
  ...(queryParams.monthlyFeeId && { monthlyFeeId: queryParams.monthlyFeeId }),
  ...(queryParams.gradeId && { gradeId: queryParams.gradeId }),
  ...(queryParams.effectiveFromPeriodId && {
    effectiveFromPeriodId: queryParams.effectiveFromPeriodId,
  }),
});

export const searchMonthlyFeeOnGrade = createSearchController(
  MonthlyFeeOnGradeSearchCriteriaQueryParams,
  TYPES.MonthlyFeeFeature,
  monthlyFeeOnGradeWhereMapper,
  {
    searchMethodName: "searchMonthlyFeeOnGrade",
    searchResultName: "feeOnGrades"
  }
);
