import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { StudentFeature } from "../../features/student.feature";
import z from "zod";

const queryParamsSchema = z.object({
  studentId: z.number(),
  shoolYearId: z.number().nullable().default(null),
  includeDeleted: z
    .string()
    .optional()
    .transform((val) => val === "true")
    .default(false),
});

export async function findStudentGrades(req: Request, res: Response) {
  const studentFeature = container.get<StudentFeature>(TYPES.StudentFeature);

  const { studentId, shoolYearId, includeDeleted } = queryParamsSchema.parse(
    req.query
  );

  const studentGrades = await studentFeature.findStudentGrades(
    studentId,
    shoolYearId,
    includeDeleted
  );

  res.json({ studentGrades });
}
