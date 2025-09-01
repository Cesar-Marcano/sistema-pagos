import { Request, Response } from "express";
import { createSearchController } from "../../lib/searchController";
import { TYPES } from "../../config/types";
import { SchoolPeriodSearchCriteriaQueryParamsSchema } from "./schemas";

const schoolPeriodWhereMapper = (queryParams: any) => ({
  ...(queryParams.name && { name: queryParams.name }),
  ...(queryParams.month && { month: queryParams.month }),
  ...(queryParams.schoolYearId && { schoolYearId: queryParams.schoolYearId }),
});

export const searchSchoolPeriod = createSearchController(
  SchoolPeriodSearchCriteriaQueryParamsSchema,
  TYPES.SchoolPeriodFeature,
  schoolPeriodWhereMapper,
  {
    searchResultName: "schoolPeriods"
  }
);
