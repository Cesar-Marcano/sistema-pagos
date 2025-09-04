import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { GradeFeature } from "../../features/grade.feature";
import { CreateGradeSchema } from "./schemas";

export async function createGrade(req: Request, res: Response) {
  const { name } = CreateGradeSchema.parse(req.body);

  const gradeFeature = container.get<GradeFeature>(TYPES.GradeFeature);

  const grade = await gradeFeature.create(name);

  res.json({ grade });
}
