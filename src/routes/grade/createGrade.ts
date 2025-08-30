import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { z } from "zod";
import { GradeFeature } from "../../features/grade.feature";

const createGradeSchema = z.object({
  name: z.string().trim().toUpperCase().min(3),
});

export async function createGrade(req: Request, res: Response) {
  const { name } = createGradeSchema.parse(req.body);

  const gradeFeature = container.get<GradeFeature>(TYPES.GradeFeature);

  const grade = await gradeFeature.create(name);

  res.json({ grade });
}
