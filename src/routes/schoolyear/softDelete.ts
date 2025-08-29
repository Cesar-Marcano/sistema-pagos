import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { SchoolYearFeature } from "../../features/schoolyear.feature";

export async function softDeleteSchoolYear(req: Request, res: Response) {
  const schoolYearFeature = container.get<SchoolYearFeature>(
    TYPES.SchoolYearFeature
  );

  const schoolYear = await schoolYearFeature.softDelete(Number(req.params.id));

  res.json({ schoolYear });
}
