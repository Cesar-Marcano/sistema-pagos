import { Request, Response } from "express";
import { container } from "../../config/container";
import { TYPES } from "../../config/types";
import { SchoolPeriodFeature } from "../../features/schoolPeriod.feature";

export const softDeleteSchoolPeriod = async (req: Request, res: Response) => {
  const schoolPeriodFeature = container.get<SchoolPeriodFeature>(
    TYPES.SchoolPeriodFeature
  );

  const schoolPeriod = await schoolPeriodFeature.softDelete(
    Number(req.params.id)
  );

  res.json({ schoolPeriod });
};
