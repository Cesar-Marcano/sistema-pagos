import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { GradeFeature } from "../../features/grade.feature";
import { UpdateGradeSchema } from "./schemas";

export async function updateGrade(req: Request, res: Response) {
  const validatedData = UpdateGradeSchema.parse(req.body);

  const gradeFeature = container.get<GradeFeature>(TYPES.GradeFeature);

  const grade = await gradeFeature.update(
    Number(req.params.id),
    validatedData.name,
    validatedData.tier
  );

  res.json({ grade });
}
