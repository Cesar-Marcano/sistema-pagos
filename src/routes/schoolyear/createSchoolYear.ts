import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { z } from "zod";
import { SchoolYearFeature } from "../../features/schoolyear.feature";

const createSchoolYearSchema = z
  .object({
    name: z.string().min(1, "El nombre del año escolar es requerido."),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "El formato de fecha debe ser YYYY-MM-DD."),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "El formato de fecha debe ser YYYY-MM-DD."),
  })
  .refine(
    (data) => new Date(data.endDate) > new Date(data.startDate),
    {
      message: "La fecha de fin debe ser posterior a la fecha de inicio.",
      path: ["endDate"],
    }
  );

export async function createSchoolYear(req: Request, res: Response) {
  const { name, startDate, endDate } = createSchoolYearSchema.parse(req.body);

  const schoolYearFeature = container.get<SchoolYearFeature>(
    TYPES.SchoolYearFeature
  );

  const schoolYear = await schoolYearFeature.create(name, new Date(startDate), new Date(endDate));

  res.json({ schoolYear });
}
