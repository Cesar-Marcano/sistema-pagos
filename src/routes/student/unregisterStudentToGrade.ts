import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { StudentFeature } from "../../features/student.feature";

export async function unregisterStudentFromGrade(req: Request, res: Response) {
  const studentFeature = container.get<StudentFeature>(TYPES.StudentFeature);

  const studentGrade = await studentFeature.unregisterStudentFromGrade(
    Number(req.params.id)
  );

  res.json({ studentGrade });
}
