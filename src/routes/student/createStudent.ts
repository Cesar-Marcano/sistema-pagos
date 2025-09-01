import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { z } from "zod";
import { StudentFeature } from "../../features/student.feature";
import { CreateStudentSchema } from "./schemas";

export async function createStudent(req: Request, res: Response) {
  const { name } = CreateStudentSchema.parse(req.body);

  const studentFeature = container.get<StudentFeature>(TYPES.StudentFeature);

  const student = await studentFeature.create(name);

  res.status(201).json({ student });
}
