import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { SchoolPeriodFeature } from "../../features/schoolPeriod.feature";
import { CreateSchoolPeriodSchema } from "./schemas";

export async function createSchoolPeriod(req: Request, res: Response) {
  const { name, month, schoolYearId } = CreateSchoolPeriodSchema.parse(
    req.body
  );

  const schoolPeriodFeature = container.get<SchoolPeriodFeature>(
    TYPES.SchoolPeriodFeature
  );

  const schoolPeriod = await schoolPeriodFeature.create(
    schoolYearId,
    month,
    name
  );

  res.status(201).json({ schoolPeriod });
}
