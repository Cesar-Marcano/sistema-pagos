import { Request, Response } from "express";
import { container } from "../../config/container";
import { TYPES } from "../../config/types";
import { SchoolPeriodFeature } from "../../features/schoolPeriod.feature";
import { CreateSchoolPeriodSchema } from "./schemas";

export const createSchoolPeriod = async (req: Request, res: Response) => {
  const schoolPeriodFeature = container.get<SchoolPeriodFeature>(
    TYPES.SchoolPeriodFeature
  );

  const { name, schoolYearId } = CreateSchoolPeriodSchema.parse(req.body);

  const schoolPeriod = await schoolPeriodFeature.create(name, schoolYearId);

  res.status(201).json({ schoolPeriod });
};
