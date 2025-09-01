import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import createHttpError from "http-errors";
import { StudentFeature } from "../../features/student.feature";
import { FindByIdParamsSchema } from "../../lib/findByIdParamsSchema";

export async function findStudentById(req: Request, res: Response) {
  const studentFeature = container.get<StudentFeature>(TYPES.StudentFeature);

  const queryParams = FindByIdParamsSchema.parse(req.query);

  const student = await studentFeature.findById(
    Number(req.params.id),
    queryParams.includeDeleted
  );

  if (!student) throw createHttpError(404, "Estudiante no encontrado.");

  res.status(200).json({ student });
}
