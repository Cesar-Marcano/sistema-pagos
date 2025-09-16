import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { GradeFeature } from "../../features/grade.feature";
import { FindStudentsByGradeAndYearParams } from "./schemas";

export async function findStudentsInGrade(req: Request, res: Response) {
  const gradeFeature = container.get<GradeFeature>(TYPES.GradeFeature);

  const { gradeId, schoolYearId } = FindStudentsByGradeAndYearParams.parse(
    req.params
  );

  const students = await gradeFeature.findStudentsByGradeAndYear(
    gradeId,
    schoolYearId
  );

  res.json({ students });
}
