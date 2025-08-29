import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { StudentFeature } from "../../features/student.feature";

export async function softDeleteStudent(req: Request, res: Response) {
  const studentFeature = container.get<StudentFeature>(TYPES.StudentFeature);

  const student = await studentFeature.softDelete(Number(req.params.id));

  res.json({ student });
}
