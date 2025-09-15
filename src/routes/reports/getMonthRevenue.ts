import { Request, Response } from "express";
import { container } from "../../config/container";
import { TYPES } from "../../config/types";
import { ReportsFeature } from "../../features/reports.feature";
import { MonthRevenueQueryParamsSchema } from "./schemas";

export const getMonthRevenue = async (req: Request, res: Response) => {
  const reportsFeature = container.get<ReportsFeature>(TYPES.ReportsFeature);

  const { schoolMonthId } = MonthRevenueQueryParamsSchema.parse(req.query);

  const revenue = await reportsFeature.getMonthRevenue(schoolMonthId);

  res.json({
    expectedRevenue: revenue.expectedRevenue.toString(),
    totalRevenue: revenue.totalRevenue.toString(),
  });
};
