import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { SchoolYearFeature } from "../../features/schoolyear.feature";
import z from "zod";

const paramsSchema = z.object({
  includeDeleted: z
    .boolean("Include deleted debe ser tipo boolean.")
    .default(false),
});

export async function findSchoolYearById(req: Request, res: Response) {
  const schoolYearFeature = container.get<SchoolYearFeature>(
    TYPES.SchoolYearFeature
  );

  const queryParams = paramsSchema.parse(req.query);

  const schoolYear = await schoolYearFeature.findById(
    Number(req.params.id),
    queryParams.includeDeleted
  );

  res.json({ schoolYear });
}
