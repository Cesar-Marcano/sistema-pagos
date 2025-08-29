import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import z from "zod";
import createHttpError from "http-errors";
import { SchoolPeriodFeature } from "../../features/schoolPeriod.feature";

const paramsSchema = z.object({
  includeDeleted: z
    .boolean("Include deleted debe ser tipo boolean.")
    .default(false),
});

export async function findSchoolPeriodById(req: Request, res: Response) {
  const schoolPeriodFeature = container.get<SchoolPeriodFeature>(
    TYPES.SchoolPeriodFeature
  );

  const queryParams = paramsSchema.parse(req.query);

  const schoolPeriod = await schoolPeriodFeature.findById(
    Number(req.params.id),
    queryParams.includeDeleted
  );

  if (!schoolPeriod) throw createHttpError(404, "Periodo escolar no encontrado.");

  res.json({ schoolPeriod });
}
