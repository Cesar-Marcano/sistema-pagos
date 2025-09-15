import { Request, Response } from "express";
import { container } from "../../config/container";
import { TYPES } from "../../config/types";
import { SchoolPeriodFeature } from "../../features/schoolPeriod.feature";
import { UpdateSchoolPeriodSchema } from "./schemas";

export const updateSchoolPeriod = async (req: Request, res: Response) => {
  const schoolPeriodFeature = container.get<SchoolPeriodFeature>(
    TYPES.SchoolPeriodFeature
  );

  const data = UpdateSchoolPeriodSchema.parse(req.body);

  const schoolPeriod = await schoolPeriodFeature.update(
    Number(req.params.id),
    data
  );

  res.json({ schoolPeriod });
};
