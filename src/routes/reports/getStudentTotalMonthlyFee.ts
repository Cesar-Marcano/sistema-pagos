import { Request, Response } from "express";
import { container } from "../../config/container";
import { TYPES } from "../../config/types";
import { ReportsFeature } from "../../features/reports.feature";
import { StudentTotalMonthlyFeeQueryParamsSchema } from "./schemas";

export const getStudentTotalMonthlyFee = async (
  req: Request,
  res: Response
) => {
  const reportsFeature = container.get<ReportsFeature>(TYPES.ReportsFeature);

  const { gradeId, studentId, schoolMonthId } =
    StudentTotalMonthlyFeeQueryParamsSchema.parse(req.query);

  const totalMonthlyFee = await reportsFeature.getStudentTotalMonthlyFee(
    gradeId,
    studentId,
    schoolMonthId
  );

  res.json({
    totalMonthlyFee: totalMonthlyFee.toString(),
  });
};
