import z from "zod";
import { getRegistry } from "../../config/openApiRegistry";

const registry = getRegistry();

export const GradeSchema = registry.register(
  "GradeSchema",
  z.object({
    createdAt: z.date(),
    deletedAt: z.date().nullable(),
    id: z.number().positive(),
    name: z.string().trim().toUpperCase().min(3),
    updatedAt: z.date(),
  })
);

export const CreateGradeSchema = registry.register(
  "CreateGradeSchema",
  GradeSchema.pick({ name: true })
);

export const GradeSearchCriteriaQueryParams = registry.register(
  "GradeSearchCriteriaQuery",
  z.object({
    name: z.string().optional(),
  })
);

export const FindStudentsByGradeAndYearQueryParams = registry.register(
  "FindStudentsByGradeAndYearQueryParams",
  z.object({
    gradeId: z.number().positive(),
    schoolYearId: z.number().positive(),
  })
);

export const UpdateGradeSchema = registry.register(
  "UpdateGradeSchema",
  GradeSchema.pick({ name: true })
);
