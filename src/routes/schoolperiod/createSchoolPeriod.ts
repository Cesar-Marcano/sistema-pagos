import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { z } from "zod";
import { SchoolPeriodFeature } from "../../features/schoolPeriod.feature";

const createSchoolPeriodSchema = z.object({
  month: z.number().min(1),
  schoolYearId: z.number().min(1),
  name: z.string().trim().optional(),
});

export async function createSchoolPeriod(req: Request, res: Response) {
  const { name, month, schoolYearId } = createSchoolPeriodSchema.parse(
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

  res.json({ schoolPeriod });
}
