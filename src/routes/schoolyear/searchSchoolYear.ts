import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { SchoolYearFeature } from "../../features/schoolyear.feature";
import { z } from "zod";

const searchSchoolYearSchema = z.object({
  page: z.string().optional().default("1").transform(Number),
  pageSize: z.string().optional().default("10").transform(Number),
  name: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function searchSchoolYear(req: Request, res: Response) {
  const queryParams = searchSchoolYearSchema.parse(req.query);

  const searchArgs = {
    page: queryParams.page,
    pageSize: queryParams.pageSize,
    where: {
      ...(queryParams.name && { name: queryParams.name }),
      ...(queryParams.startDate && {
        startDate: new Date(queryParams.startDate),
      }),
      ...(queryParams.endDate && { endDate: new Date(queryParams.endDate) }),
    },
  };

  const schoolYearFeature = container.get<SchoolYearFeature>(
    TYPES.SchoolYearFeature
  );
  const schoolYears = await schoolYearFeature.search(searchArgs);

  res.json({ schoolYears });
}
