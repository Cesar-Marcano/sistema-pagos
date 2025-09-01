import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { StudentFeature } from "../../features/student.feature";
import { UpdateStudentSchema } from "./schemas";

export async function updateStudent(req: Request, res: Response) {
  const validatedData = UpdateStudentSchema.parse(req.body);

  const studentFeature = container.get<StudentFeature>(TYPES.StudentFeature);

  const student = await studentFeature.update(
    Number(req.params.id),
    validatedData.name
  );

  res.json({ student });
}
