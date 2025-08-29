import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { z } from "zod";
import { GradeFeature } from "../../features/grade.feature";

const updateGradeSchema = z.object({
  name: z.string().trim().toUpperCase().min(3),
});

export async function updateGrade(req: Request, res: Response) {
  const validatedData = updateGradeSchema.parse(req.body);

  const gradeFeature = container.get<GradeFeature>(TYPES.GradeFeature);

  const grade = await gradeFeature.update(
    Number(req.params.id),
    validatedData.name
  );

  res.json({ grade });
}
