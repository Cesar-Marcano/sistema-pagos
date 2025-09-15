import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { SchoolMonthFeature } from "../../features/schoolMonth.feature";
import { CreateSchoolMonthSchema } from "./schemas";

export async function createSchoolMonth(req: Request, res: Response) {
  const { name, month, schoolPeriodId } = CreateSchoolMonthSchema.parse(
    req.body
  );

  const schoolMonthFeature = container.get<SchoolMonthFeature>(
    TYPES.SchoolMonthFeature
  );

  const schoolMonth = await schoolMonthFeature.create(
    schoolPeriodId,
    month,
    name
  );

  res.status(201).json({ schoolMonth });
}
