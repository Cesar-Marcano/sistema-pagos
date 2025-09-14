import z from "zod";
import { getRegistry } from "../../config/openApiRegistry";

const registry = getRegistry();

export const SchoolMonthSchema = registry.register(
  "SchoolMonthSchema",
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

export const CreateSchoolMonthSchema = registry.register(
  "CreateSchoolMonthSchema",
  SchoolMonthSchema.pick({ name: true, month: true, schoolYearId: true })
);

export const SchoolMonthSearchCriteriaQueryParamsSchema = registry.register(
  "SchoolMonthSearchCriteriaQuery",
  z.object({
    name: z.string().optional(),
    month: z.string().optional().transform(Number),
    schoolYearId: z.string().transform(Number).pipe(z.number().positive()).optional(),
  })
);

export const UpdateSchoolMonthSchema = registry.register(
  "UpdateSchoolMonthSchema",
  CreateSchoolMonthSchema.partial()
);
