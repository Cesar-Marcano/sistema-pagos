import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { StudentFeature } from "../../features/student.feature";
import { RegisterStudentToGradeSchema } from "./schemas";

export async function registerStudentToGrade(req: Request, res: Response) {
  const { studentId, gradeId, schoolPeriodId } =
    RegisterStudentToGradeSchema.parse(req.body);

  const studentFeature = container.get<StudentFeature>(TYPES.StudentFeature);

  const studentGrade = await studentFeature.registerStudentToGrade(
    studentId,
    gradeId,
    schoolPeriodId
  );

  res.json({ studentGrade });
}
