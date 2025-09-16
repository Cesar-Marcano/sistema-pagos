import z from "zod";
import { getRegistry } from "../../config/openApiRegistry";
import { FindByIdParamsSchema } from "../../lib/findByIdParamsSchema";
import { StudentGrade } from "@prisma/client";

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
    studentId: z.string().transform(Number).pipe(z.number().positive()),
    schoolPeriodId: z
      .string()
      .transform(Number)
      .pipe(z.number().positive())
      .nullable()
      .default(null),
  })
);

export const HasGradeQueryParamsSchema = registry.register(
  "HasGradeQuery",
  z.object({
    studentId: z.string().transform(Number).pipe(z.number().positive()),
    gradeId: z.string().transform(Number).pipe(z.number().positive()),
  })
);

export const RegisterStudentToGradeSchema = registry.register(
  "RegisterStudentToGradeSchema",
  z.object({
    studentId: z.number(),
    gradeId: z.number(),
    schoolPeriodId: z.number(),
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

export const StudentGradeSchema = registry.register(
  "StudentGradeSchema",
  z.object({
    createdAt: z.date(),
    deletedAt: z.date().nullable(),
    gradeId: z.number().positive(),
    id: z.number().positive(),
    schoolPeriodId: z.number().positive(),
    studentId: z.number().positive(),
    updatedAt: z.date(),
  })
);

export const EnrollActiveStudentsToNextPeriodSchema = registry.register(
  "EnrollActiveStudentsToNextPeriodSchema",
  z.object({
    currentSchoolPeriodId: z.number().positive(),
    nextSchoolPeriodId: z.number().positive(),
  })
);
