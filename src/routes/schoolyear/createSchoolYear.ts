import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { SchoolYearFeature } from "../../features/schoolyear.feature";
import { CreateSchoolYearSchema } from "./schemas";

export async function createSchoolYear(req: Request, res: Response) {
  const { name, startDate, endDate } = CreateSchoolYearSchema.parse(req.body);

  const schoolYearFeature = container.get<SchoolYearFeature>(
    TYPES.SchoolYearFeature
  );

  const schoolYear = await schoolYearFeature.create(
    name,
    new Date(startDate),
    new Date(endDate)
  );

  res.json({ schoolYear });
}
