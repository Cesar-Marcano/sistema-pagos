import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { SchoolPeriodFeature } from "../../features/schoolPeriod.feature";

export async function softDeleteSchoolPeriod(req: Request, res: Response) {
  const schoolPeriodFeature = container.get<SchoolPeriodFeature>(
    TYPES.SchoolPeriodFeature
  );

  const schoolPeriod = await schoolPeriodFeature.softDelete(
    Number(req.params.id)
  );

  res.json({ schoolPeriod });
}
