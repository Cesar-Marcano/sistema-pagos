import { Request, Response } from "express";
import { z } from "zod";
import { createSearchController } from "../../lib/searchController";
import { TYPES } from "../../config/types";

const gradeSearchCriteria = z.object({
  name: z.string().optional(),
});

const gradeWhereMapper = (queryParams: any) => ({
  ...(queryParams.name && { name: queryParams.name }),
});

export const searchGrade = createSearchController(
  gradeSearchCriteria,
  TYPES.GradeFeature,
  gradeWhereMapper
);
