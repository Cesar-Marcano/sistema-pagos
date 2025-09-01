import z from "zod";
import { getRegistry } from "../../config/openApiRegistry";

const registry = getRegistry();

export const SchoolYearSchema = registry.register(
  "SchoolYearSchema",
  z
    .object({
      createdAt: z.date(),
      deletedAt: z.date().nullable(),
      endDate: z.date(),
      id: z.number().positive(),
      name: z
        .string()
        .trim()
        .toUpperCase()
        .regex(
          /^AÑO-ESCOLAR-\d{4}-\d{4}$/,
          "El nombre debe tener el formato AÑO-ESCOLAR-YYYY-YYYY."
        ),
      startDate: z.date(),
      updatedAt: z.date(),
    })
    .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
      message: "La fecha de fin debe ser posterior a la fecha de inicio.",
      path: ["endDate"],
    })
);

export const CreateSchoolYearSchema = registry.register(
  "CreateSchoolYearSchema",
  SchoolYearSchema.pick({ name: true })
    .extend({
      startDate: z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
          "El formato de fecha debe ser YYYY-MM-DD."
        ),
      endDate: z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
          "El formato de fecha debe ser YYYY-MM-DD."
        ),
    })
    .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
      message: "La fecha de fin debe ser posterior a la fecha de inicio.",
      path: ["endDate"],
    })
);

export const SchoolYearSearchCriteriaQueryParamsSchema = registry.register(
  "SchoolYearSearchCriteriaQuery",
  z.object({
    name: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
);

export const UpdateSchoolYearSchema = registry.register("UpdateSchoolYearSchema", CreateSchoolYearSchema.partial())
