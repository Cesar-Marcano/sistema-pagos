import { Request, Response } from "express";
import { container } from "../../config/container";
import { TYPES } from "../../config/types";
import { ReportsFeature } from "../../features/reports.feature";
import { StudentsInOverdueQueryParamsSchema } from "./schemas";

export const getStudentsInOverdue = async (req: Request, res: Response) => {
  const reportsFeature = container.get<ReportsFeature>(TYPES.ReportsFeature);

  const { schoolMonthId } = StudentsInOverdueQueryParamsSchema.parse(req.query);

  const overdueStudents = await reportsFeature.getStudentsInOverdue(
    schoolMonthId
  );

  const formattedStudents = overdueStudents.map((student) => ({
    ...student,
    totalFee: student.totalFee.toString(),
    paid: student.paid.toString(),
    due: student.due.toString(),
  }));

  res.json({
    overdueStudents: formattedStudents,
  });
};
