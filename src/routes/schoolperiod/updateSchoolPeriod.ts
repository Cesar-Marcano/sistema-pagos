import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { z } from "zod";
import { SchoolPeriodFeature } from "../../features/schoolPeriod.feature";

const updateSchoolPeriodSchema = z.object({
  month: z.number().min(1).optional(),
  schoolYearId: z.number().min(1).optional(),
  name: z.string().trim().optional(),
});

export async function updateSchoolPeriod(req: Request, res: Response) {
  const updateData = updateSchoolPeriodSchema.parse(req.body);

  const schoolPeriodFeature = container.get<SchoolPeriodFeature>(
    TYPES.SchoolPeriodFeature
  );

  const schoolPeriod = await schoolPeriodFeature.update(
    Number(req.params.id),
    updateData
  );

  res.json({ schoolPeriod });
}
