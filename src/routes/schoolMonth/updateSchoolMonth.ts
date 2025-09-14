import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { SchoolMonthFeature } from "../../features/schoolMonth.feature";
import { UpdateSchoolMonthSchema } from "./schemas";

export async function updateSchoolMonth(req: Request, res: Response) {
  const updateData = UpdateSchoolMonthSchema.parse(req.body);

  const schoolMonthFeature = container.get<SchoolMonthFeature>(
    TYPES.SchoolMonthFeature
  );

  const schoolMonth = await schoolMonthFeature.update(
    Number(req.params.id),
    updateData
  );

  res.status(200).json({ schoolMonth });
}
