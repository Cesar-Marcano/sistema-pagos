import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import createHttpError from "http-errors";
import { SchoolMonthFeature } from "../../features/schoolMonth.feature";
import { FindByIdParamsSchema } from "../../lib/findByIdParamsSchema";

export async function findSchoolMonthById(req: Request, res: Response) {
  const schoolMonthFeature = container.get<SchoolMonthFeature>(
    TYPES.SchoolMonthFeature
  );

  const queryParams = FindByIdParamsSchema.parse(req.query);

  const schoolMonth = await schoolMonthFeature.findById(
    Number(req.params.id),
    queryParams.includeDeleted
  );

  if (!schoolMonth)
    throw createHttpError(404, "Mes escolar no encontrado.");

  res.status(200).json({ schoolMonth });
}
