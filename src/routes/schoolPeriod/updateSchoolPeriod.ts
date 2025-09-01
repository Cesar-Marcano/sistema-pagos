import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { SchoolPeriodFeature } from "../../features/schoolPeriod.feature";
import { UpdateSchoolPeriodSchema } from "./schemas";

export async function updateSchoolPeriod(req: Request, res: Response) {
  const updateData = UpdateSchoolPeriodSchema.parse(req.body);

  const schoolPeriodFeature = container.get<SchoolPeriodFeature>(
    TYPES.SchoolPeriodFeature
  );

  const schoolPeriod = await schoolPeriodFeature.update(
    Number(req.params.id),
    updateData
  );

  res.json({ schoolPeriod });
}
