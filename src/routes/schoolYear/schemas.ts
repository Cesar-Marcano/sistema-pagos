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
  z
    .object({
      startDate: z.string().transform((date) => new Date(date)),
      endDate: z.string().transform((date) => new Date(date)),
      automaticallyGenerateSchoolPeriodsAndMonths: z
        .boolean()
        .optional()
        .default(true),
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

export const UpdateSchoolYearSchema = registry.register(
  "UpdateSchoolYearSchema",
  CreateSchoolYearSchema.omit({
    automaticallyGenerateSchoolPeriodsAndMonths: true,
  })
    .partial()
    .extend({
      name: z
        .string()
        .trim()
        .toUpperCase()
        .regex(
          /^AÑO-ESCOLAR-\d{4}-\d{4}$/,
          "El nombre debe tener el formato AÑO-ESCOLAR-YYYY-YYYY."
        )
        .optional(),
    })
);
