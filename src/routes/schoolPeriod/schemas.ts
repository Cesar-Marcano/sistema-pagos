import { z } from "zod";
import { getRegistry } from "../../config/openApiRegistry";

const registry = getRegistry();

export const SchoolPeriodSchema = registry.register(
  "SchoolPeriodSchema",
  z
    .object({
      id: z.number().positive(),
      name: z.string().trim().toUpperCase(),
      schoolYearId: z.number().positive(),
      schoolYear: z
        .object({
          id: z.number().positive(),
          name: z.string(),
          startDate: z.date(),
          endDate: z.date(),
        })
        .optional(),
      createdAt: z.date(),
      updatedAt: z.date(),
      deletedAt: z.date().nullable(),
    })
    .openapi("SchoolPeriod")
);

export const CreateSchoolPeriodSchema = registry.register(
  "CreateSchoolPeriodSchema",
  z.object({
    name: z.string().trim().toUpperCase().min(1, "El nombre es requerido"),
    schoolYearId: z
      .number()
      .positive("El ID del año escolar debe ser positivo"),
  })
);

export const UpdateSchoolPeriodSchema = registry.register(
  "UpdateSchoolPeriodSchema",
  z.object({
    name: z
      .string()
      .trim()
      .toUpperCase()
      .min(1, "El nombre es requerido")
      .optional(),
    schoolYearId: z
      .number()
      .positive("El ID del año escolar debe ser positivo")
      .optional(),
  })
);

export const SchoolPeriodSearchCriteriaQueryParamsSchema = registry.register(
  "SchoolPeriodSearchCriteriaQueryParamsSchema",
  z.object({
    name: z.string().trim().toUpperCase().optional(),
    schoolYearId: z.coerce.number().positive().optional(),
    deletedAt: z
      .object({
        not: z.null(),
      })
      .optional(),
  })
);
