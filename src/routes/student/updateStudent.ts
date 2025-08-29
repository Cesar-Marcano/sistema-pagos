import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { z } from "zod";
import { StudentFeature } from "../../features/student.feature";

const updateStudentSchema = z.object({
  name: z.string().trim().toUpperCase().min(3),
});

export async function updateStudent(req: Request, res: Response) {
  const validatedData = updateStudentSchema.parse(req.body);

  const studentFeature = container.get<StudentFeature>(TYPES.StudentFeature);

  const student = await studentFeature.update(
    Number(req.params.id),
    validatedData.name
  );

  res.json({ student });
}
