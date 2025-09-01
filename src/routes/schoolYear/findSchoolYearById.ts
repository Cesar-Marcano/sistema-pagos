import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { SchoolYearFeature } from "../../features/schoolyear.feature";
import createHttpError from "http-errors";
import { FindByIdParamsSchema } from "../../lib/findByIdParamsSchema";

export async function findSchoolYearById(req: Request, res: Response) {
  const schoolYearFeature = container.get<SchoolYearFeature>(
    TYPES.SchoolYearFeature
  );

  const queryParams = FindByIdParamsSchema.parse(req.query);

  const schoolYear = await schoolYearFeature.findById(
    Number(req.params.id),
    queryParams.includeDeleted
  );

  if (!schoolYear) throw createHttpError(404, "Año escolar no encontrado.");

  res.json({ schoolYear });
}
