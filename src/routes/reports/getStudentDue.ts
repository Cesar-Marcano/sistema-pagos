import { Request, Response } from "express";
import { container } from "../../config/container";
import { TYPES } from "../../config/types";
import { ReportsFeature } from "../../features/reports.feature";
import { StudentDueQueryParamsSchema } from "./schemas";

export const getStudentDue = async (req: Request, res: Response) => {
  const reportsFeature = container.get<ReportsFeature>(TYPES.ReportsFeature);

  const { schoolMonthId, studentId } = StudentDueQueryParamsSchema.parse(
    req.query
  );

  const studentDue = await reportsFeature.getStudentDue(
    schoolMonthId,
    studentId
  );

  res.json({
    totalPaid: studentDue.totalPaid.toString(),
    totalMonthlyFee: studentDue.totalMonthlyFee.toString(),
    due: studentDue.due.toString(),
  });
};
