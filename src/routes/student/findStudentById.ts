import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import z from "zod";
import createHttpError from "http-errors";
import { StudentFeature } from "../../features/student.feature";

const paramsSchema = z.object({
  includeDeleted: z
    .boolean("Include deleted debe ser tipo boolean.")
    .default(false),
});

export async function findStudentById(req: Request, res: Response) {
  const studentFeature = container.get<StudentFeature>(TYPES.StudentFeature);

  const queryParams = paramsSchema.parse(req.query);

  const student = await studentFeature.findById(
    Number(req.params.id),
    queryParams.includeDeleted
  );

  if (!student) throw createHttpError(404, "Estudiante no encontrado.");

  res.json({ student });
}
