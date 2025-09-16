import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { StudentFeature } from "../../features/student.feature";
import { EnrollActiveStudentsToNextPeriodSchema } from "./schemas";

export async function enrollActiveStudentsToNextPeriod(req: Request, res: Response) {
  const { currentSchoolPeriodId, nextSchoolPeriodId } =
    EnrollActiveStudentsToNextPeriodSchema.parse(req.body);

  const studentFeature = container.get<StudentFeature>(TYPES.StudentFeature);

  const result = await studentFeature.enrollActiveStudentsToNextPeriod(
    currentSchoolPeriodId,
    nextSchoolPeriodId
  );

  res.json(result);
}
