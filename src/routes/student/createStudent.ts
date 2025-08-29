import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { z } from "zod";
import { StudentFeature } from "../../features/student.feature";

const createStudentSchema = z.object({
  name: z.string().trim().min(3),
});

export async function createStudent(req: Request, res: Response) {
  const { name } = createStudentSchema.parse(req.body);

  const studentFeature = container.get<StudentFeature>(TYPES.StudentFeature);

  const student = await studentFeature.create(name);

  res.json({ student });
}
