import { Request, Response } from "express";
import { z } from "zod";
import { createSearchController } from "../../lib/searchController";
import { TYPES } from "../../config/types";

const studentSearchCriteria = z.object({
  name: z.string().optional(),
});

const studentWhereMapper = (queryParams: any) => ({
  ...(queryParams.name && { name: queryParams.name }),
});

export const searchStudent = createSearchController(
  studentSearchCriteria,
  TYPES.StudentFeature,
  studentWhereMapper
);
