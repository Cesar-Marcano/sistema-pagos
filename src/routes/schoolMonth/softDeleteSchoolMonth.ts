import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { SchoolMonthFeature } from "../../features/schoolMonth.feature";

export async function softDeleteSchoolMonth(req: Request, res: Response) {
  const schoolMonthFeature = container.get<SchoolMonthFeature>(
    TYPES.SchoolMonthFeature
  );

  const schoolMonth = await schoolMonthFeature.softDelete(
    Number(req.params.id)
  );

  res.status(200).json({ schoolMonth });
}
