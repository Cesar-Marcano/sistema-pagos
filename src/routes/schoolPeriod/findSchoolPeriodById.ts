import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import createHttpError from "http-errors";
import { SchoolPeriodFeature } from "../../features/schoolPeriod.feature";
import { FindByIdParamsSchema } from "../../lib/findByIdParamsSchema";

export async function findSchoolPeriodById(req: Request, res: Response) {
  const schoolPeriodFeature = container.get<SchoolPeriodFeature>(
    TYPES.SchoolPeriodFeature
  );

  const queryParams = FindByIdParamsSchema.parse(req.query);

  const schoolPeriod = await schoolPeriodFeature.findById(
    Number(req.params.id),
    queryParams.includeDeleted
  );

  if (!schoolPeriod)
    throw createHttpError(404, "Periodo escolar no encontrado.");

  res.status(200).json({ schoolPeriod });
}
