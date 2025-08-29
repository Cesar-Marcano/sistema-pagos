import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { z } from "zod";
import { StudentFeature } from "../../features/student.feature";

const registerStudentToGradeSchema = z.object({
  studentId: z.number(),
  gradeId: z.number(),
  schoolYearId: z.number(),
});

export async function registerStudentToGrade(req: Request, res: Response) {
  const { studentId, gradeId, schoolYearId } =
    registerStudentToGradeSchema.parse(req.body);

  const studentFeature = container.get<StudentFeature>(TYPES.StudentFeature);

  const studentGrade = await studentFeature.registerStudentToGrade(
    studentId,
    gradeId,
    schoolYearId
  );

  res.json({ studentGrade });
}
