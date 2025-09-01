import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { SchoolYearFeature } from "../../features/schoolyear.feature";
import { UpdateSchoolYearSchema } from "./schemas";

export async function updateSchoolYear(req: Request, res: Response) {
  const validatedData = UpdateSchoolYearSchema.parse(req.body);

  const schoolYearFeature = container.get<SchoolYearFeature>(
    TYPES.SchoolYearFeature
  );

  const updateData: {
    name?: string;
    startDate?: Date;
    endDate?: Date;
  } = {};

  if (validatedData.name) {
    updateData.name = validatedData.name;
  }

  if (validatedData.startDate) {
    updateData.startDate = new Date(validatedData.startDate);
  }

  if (validatedData.endDate) {
    updateData.endDate = new Date(validatedData.endDate);
  }

  const schoolYear = await schoolYearFeature.update(
    Number(req.params.id),
    updateData
  );

  res.json({ schoolYear });
}
