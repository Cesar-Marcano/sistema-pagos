import { Request, Response } from "express";
import { createSearchController } from "../../lib/searchController";
import { TYPES } from "../../config/types";
import { MonthlyFeeSearchCriteriaQueryParams } from "./schemas";

const monthlyFeeWhereMapper = (queryParams: any) => ({
  ...(queryParams.description && { description: queryParams.description }),
  ...(queryParams.amount && { amount: queryParams.amount }),
});

export const searchMonthlyFee = createSearchController(
  MonthlyFeeSearchCriteriaQueryParams,
  TYPES.MonthlyFeeFeature,
  monthlyFeeWhereMapper,
  {
    searchResultName: "monthlyFees"
  }
);
