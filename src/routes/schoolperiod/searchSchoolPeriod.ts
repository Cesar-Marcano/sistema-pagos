import { Request, Response } from "express";
import { z } from "zod";
import { createSearchController } from "../../lib/searchController";
import { TYPES } from "../../config/types";

const schoolPeriodSearchCriteria = z.object({
  name: z.string().optional(),
  month: z.number().optional(),
  schoolYearId: z.number().optional(),
});

const schoolPeriodWhereMapper = (queryParams: any) => ({
  ...(queryParams.name && { name: queryParams.name }),
  ...(queryParams.month && { month: queryParams.month }),
  ...(queryParams.schoolYearId && { schoolYearId: queryParams.schoolYearId }),
});

export const searchSchoolPeriod = createSearchController(
  schoolPeriodSearchCriteria,
  TYPES.SchoolPeriodFeature,
  schoolPeriodWhereMapper
);
