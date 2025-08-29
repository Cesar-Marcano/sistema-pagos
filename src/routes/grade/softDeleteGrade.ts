import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { GradeFeature } from "../../features/grade.feature";

export async function softDeleteGrade(req: Request, res: Response) {
  const gradeFeature = container.get<GradeFeature>(TYPES.GradeFeature);

  const grade = await gradeFeature.softDeleteGrade(Number(req.params.id));

  res.json({ schoolYear: grade });
}
