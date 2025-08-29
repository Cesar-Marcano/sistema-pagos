import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { StudentFeature } from "../../features/student.feature";
import z from "zod";

const queryParamsSchema = z.object({
  studentId: z.number(),
  gradeId: z.number(),
});

export async function hasGrade(req: Request, res: Response) {
  const studentFeature = container.get<StudentFeature>(TYPES.StudentFeature);

  const { studentId, gradeId } = queryParamsSchema.parse(req.query);

  const hasGrade = await studentFeature.hasGrade(studentId, gradeId);

  res.json({ hasGrade });
}
