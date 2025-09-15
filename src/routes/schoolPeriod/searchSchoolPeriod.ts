import { Request, Response } from "express";
import { createSearchController } from "../../lib/searchController";
import { TYPES } from "../../config/types";
import { SchoolPeriodSearchCriteriaQueryParamsSchema } from "./schemas";

const schoolPeriodWhereMapper = (queryParams: any) => ({
  ...(queryParams.name && { name: queryParams.name }),
  ...(queryParams.schoolYearId && { schoolYearId: queryParams.schoolYearId }),
  ...(queryParams.deletedAt && { deletedAt: queryParams.deletedAt }),
});

export const searchSchoolPeriod = createSearchController(
  SchoolPeriodSearchCriteriaQueryParamsSchema,
  TYPES.SchoolPeriodFeature,
  schoolPeriodWhereMapper
);
