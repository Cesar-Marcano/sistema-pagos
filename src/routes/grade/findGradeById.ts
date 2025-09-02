import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { GradeFeature } from "../../features/grade.feature";
import createHttpError from "http-errors";
import { FindByIdParamsSchema } from "../../lib/findByIdParamsSchema";

export async function findGradeById(req: Request, res: Response) {
  const gradeFeature = container.get<GradeFeature>(TYPES.GradeFeature);

  const queryParams = FindByIdParamsSchema.parse(req.query);

  const grade = await gradeFeature.findById(
    Number(req.params.id),
    queryParams.includeDeleted
  );

  if (!grade) throw createHttpError(404, "Grado no encontrado.");

  res.json({ grade });
}
