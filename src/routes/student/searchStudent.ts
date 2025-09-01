import { Request, Response } from "express";
import { createSearchController } from "../../lib/searchController";
import { TYPES } from "../../config/types";
import { StudentSearchCriteriaQueryParamsSchema } from "./schemas";

const studentWhereMapper = (queryParams: any) => ({
  ...(queryParams.name && { name: queryParams.name }),
});

export const searchStudent = createSearchController(
  StudentSearchCriteriaQueryParamsSchema,
  TYPES.StudentFeature,
  studentWhereMapper
);
