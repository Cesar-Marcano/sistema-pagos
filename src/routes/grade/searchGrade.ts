import { Request, Response } from "express";
import { createSearchController } from "../../lib/searchController";
import { TYPES } from "../../config/types";
import { GradeSearchCriteriaQueryParams } from "./schemas";

const gradeWhereMapper = (queryParams: any) => ({
  ...(queryParams.name && { name: queryParams.name }),
});

export const searchGrade = createSearchController(
  GradeSearchCriteriaQueryParams,
  TYPES.GradeFeature,
  gradeWhereMapper,
  {
    searchResultName: "grades",
  }
);
