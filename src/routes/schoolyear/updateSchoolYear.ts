import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { z } from "zod";
import { SchoolYearFeature } from "../../features/schoolyear.feature";

const updateSchoolYearSchema = z
  .object({
    name: z
      .string()
      .trim()
      .toUpperCase()
      .regex(
        /^AÑO-ESCOLAR-\d{4}-\d{4}$/,
        "El nombre debe tener el formato AÑO-ESCOLAR-YYYY-YYYY."
      )
      .optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "El formato de fecha debe ser YYYY-MM-DD.")
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "El formato de fecha debe ser YYYY-MM-DD.")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    {
      message: "La fecha de fin debe ser posterior a la fecha de inicio.",
      path: ["endDate"],
    }
  );

export async function updateSchoolYear(req: Request, res: Response) {
  const validatedData = updateSchoolYearSchema.parse(req.body);

  const schoolYearFeature = container.get<SchoolYearFeature>(
    TYPES.SchoolYearFeature
  );

  const updateData: {
    name?: string;
    startDate?: Date;
    endDate?: Date;
  } = {};

  if (validatedData.name) {
    updateData.name = validatedData.name;
  }

  if (validatedData.startDate) {
    updateData.startDate = new Date(validatedData.startDate);
  }

  if (validatedData.endDate) {
    updateData.endDate = new Date(validatedData.endDate);
  }

  const schoolYear = await schoolYearFeature.update(
    Number(req.params.id),
    updateData
  );

  res.json({ schoolYear });
}
