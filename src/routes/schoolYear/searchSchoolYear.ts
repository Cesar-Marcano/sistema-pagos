import { Request, Response } from "express";
import { createSearchController } from "../../lib/searchController";
import { TYPES } from "../../config/types";
import { SchoolYearSearchCriteriaQueryParamsSchema } from "./schemas";

const schoolYearWhereMapper = (queryParams: any) => ({
  ...(queryParams.name && { name: queryParams.name }),
  ...(queryParams.startDate && {
    startDate: new Date(queryParams.startDate),
  }),
  ...(queryParams.endDate && { endDate: new Date(queryParams.endDate) }),
});

export const searchSchoolYear = createSearchController(
  SchoolYearSearchCriteriaQueryParamsSchema,
  TYPES.SchoolYearFeature,
  schoolYearWhereMapper
);
