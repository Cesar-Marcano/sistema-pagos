import { Request, Response } from "express";
import { z } from "zod";
import { createSearchController } from "../../lib/searchController";
import { TYPES } from "../../config/types";

const schoolYearSearchCriteria = z.object({
  name: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const schoolYearWhereMapper = (queryParams: any) => ({
  ...(queryParams.name && { name: queryParams.name }),
  ...(queryParams.startDate && {
    startDate: new Date(queryParams.startDate),
  }),
  ...(queryParams.endDate && { endDate: new Date(queryParams.endDate) }),
});

export const searchSchoolYear = createSearchController(
  schoolYearSearchCriteria,
  TYPES.SchoolYearFeature,
  schoolYearWhereMapper
);
