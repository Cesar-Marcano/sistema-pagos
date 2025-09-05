import z from "zod";
import { getRegistry } from "../../config/openApiRegistry";

const registry = getRegistry();

export const SchoolPeriodSchema = registry.register(
  "SchoolPeriodSchema",
  z.object({
    createdAt: z.date(),
    deletedAt: z.date().nullable(),
    id: z.number().positive(),
    updatedAt: z.date(),
    month: z.number().min(1),
    schoolYearId: z.number().min(1),
    name: z.string().toUpperCase().trim().optional(),
  })
);

export const CreateSchoolPeriodSchema = registry.register(
  "CreateSchoolPeriodSchema",
  SchoolPeriodSchema.pick({ name: true, month: true, schoolYearId: true })
);

export const SchoolPeriodSearchCriteriaQueryParamsSchema = registry.register(
  "SchoolPeriodSearchCriteriaQuery",
  z.object({
    name: z.string().optional(),
    month: z.string().optional().transform(Number),
    schoolYearId: z.string().transform(Number).pipe(z.number().positive()).optional(),
  })
);

export const UpdateSchoolPeriodSchema = registry.register(
  "UpdateSchoolPeriodSchema",
  CreateSchoolPeriodSchema.partial()
);
