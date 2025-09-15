import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const SchoolPeriodSchema = z
  .object({
    id: z.number().positive(),
    name: z.string(),
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
  .openapi("SchoolPeriod");

export const CreateSchoolPeriodSchema = z
  .object({
    name: z.string().min(1, "El nombre es requerido"),
    schoolYearId: z.number().positive("El ID del año escolar debe ser positivo"),
  })
  .openapi("CreateSchoolPeriod");

export const UpdateSchoolPeriodSchema = z
  .object({
    name: z.string().min(1, "El nombre es requerido").optional(),
    schoolYearId: z
      .number()
      .positive("El ID del año escolar debe ser positivo")
      .optional(),
  })
  .openapi("UpdateSchoolPeriod");

export const SchoolPeriodSearchCriteriaQueryParamsSchema = z
  .object({
    name: z.string().optional(),
    schoolYearId: z.coerce.number().positive().optional(),
    deletedAt: z
      .object({
        not: z.null(),
      })
      .optional(),
  })
  .openapi("SchoolPeriodSearchCriteria");
