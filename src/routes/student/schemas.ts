import z from "zod";
import { getRegistry } from "../../config/openApiRegistry";
import { FindByIdParamsSchema } from "../../lib/findByIdParamsSchema";

const registry = getRegistry();

export const StudentSchema = registry.register(
  "StudentSchema",
  z.object({
    createdAt: z.date(),
    deletedAt: z.date().nullable(),
    id: z.number().positive(),
    updatedAt: z.date(),
    name: z.string().trim().min(3),
  })
);

export const CreateStudentSchema = registry.register(
  "CreateStudentSchema",
  StudentSchema.pick({
    name: true,
  })
);

export const FindStudentByGradesQuerySchema = registry.register(
  "FindStudentByGradesQuery",
  FindByIdParamsSchema.extend({
    studentId: z.number(),
    shoolYearId: z.number().nullable().default(null),
  })
);

export const HasGradeQueryParamsSchema = registry.register(
  "HasGradeQuery",
  z.object({
    studentId: z.number(),
    gradeId: z.number(),
  })
);

export const RegisterStudentToGradeSchema = registry.register(
  "RegisterStudentToGradeSchema",
  z.object({
    studentId: z.number(),
    gradeId: z.number(),
    schoolYearId: z.number(),
  })
);

export const StudentSearchCriteriaQueryParamsSchema = registry.register(
  "StudentSearchCriteriaQuery",
  z.object({
    name: z.string().optional(),
  })
);

export const UpdateStudentSchema = registry.register(
  "UpdateStudentSchema",
  StudentSchema.pick({
    name: true,
  })
);
