import { Request, Response } from "express";
import { createSearchController } from "../../lib/searchController";
import { TYPES } from "../../config/types";
import { SchoolMonthSearchCriteriaQueryParamsSchema } from "./schemas";

const schoolMonthWhereMapper = (queryParams: any) => ({
  ...(queryParams.name && { name: queryParams.name }),
  ...(queryParams.month && { month: queryParams.month }),
  ...(queryParams.schoolPeriodId && { schoolPeriodId: queryParams.schoolPeriodId }),
  ...(queryParams.schoolYearId && { 
    schoolPeriod: { 
      schoolYearId: queryParams.schoolYearId 
    } 
  }),
});

export const searchSchoolMonth = createSearchController(
  SchoolMonthSearchCriteriaQueryParamsSchema,
  TYPES.SchoolMonthFeature,
  schoolMonthWhereMapper,
  {
    searchResultName: "schoolMonths"
  }
);
