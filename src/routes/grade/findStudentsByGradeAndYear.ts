import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { GradeFeature } from "../../features/grade.feature";
import { FindStudentsByGradeAndYearQueryParams } from "./schemas";

export async function findStudentsByGradeAndYear(req: Request, res: Response) {
  const gradeFeature = container.get<GradeFeature>(TYPES.GradeFeature);

  const { gradeId, schoolYearId } = FindStudentsByGradeAndYearQueryParams.parse(
    req.body
  );

  const students = await gradeFeature.findStudentsByGradeAndYear(
    gradeId,
    schoolYearId
  );

  res.json({ students });
}
