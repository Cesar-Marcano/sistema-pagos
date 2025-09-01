import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { StudentFeature } from "../../features/student.feature";
import { FindStudentByGradesQuerySchema } from "./schemas";


export async function findStudentGrades(req: Request, res: Response) {
  const studentFeature = container.get<StudentFeature>(TYPES.StudentFeature);

  const { studentId, shoolYearId, includeDeleted } = FindStudentByGradesQuerySchema.parse(
    req.query
  );

  const studentGrades = await studentFeature.findStudentGrades(
    studentId,
    shoolYearId,
    includeDeleted
  );

  res.status(200).json({ studentGrades });
}
