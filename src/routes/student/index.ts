import { Router } from "express";
import passport from "passport";
import { createStudent } from "./createStudent";
import { findStudentById } from "./findStudentById";
import { searchStudent } from "./searchStudent";
import { updateStudent } from "./updateStudent";
import { softDeleteStudent } from "./softDeleteStudent";
import { registerStudentToGrade } from "./registerStudentToGrade";
import { unregisterStudentFromGrade } from "./unregisterStudentFromGrade";
import { hasGrade } from "./hasGrade";
import { getRegistry } from "../../config/openApiRegistry";
import {
  CreateStudentSchema,
  FindStudentByGradesQuerySchema,
  HasGradeQueryParamsSchema,
  RegisterStudentToGradeSchema,
  StudentGradeSchema,
  StudentSchema,
  StudentSearchCriteriaQueryParamsSchema,
  UpdateStudentSchema,
} from "./schemas";
import { FindByIdParamsSchema } from "../../lib/findByIdParamsSchema";
import z from "zod";
import { DefaultSearchSchema } from "../../lib/searchController";
import { ZodSearchResponseSchemaBuilder } from "../../lib/zodSearchResponse";
import { findStudentGrades } from "./findStudentGrades";
import { GradeSchema } from "../grade/schemas";
import { authenticateAndSetContext } from "../../middlewares/authenticateAndSetContext";

export const studentRoutes: Router = Router();

const registry = getRegistry();

registry.registerPath({
  description: "Registrar estudiante",
  tags: ["student"],
  method: "post",
  path: "/student",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateStudentSchema.openapi({
            default: {
              name: "Nombre Del Estudiante",
            },
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Estudiante registrado",
      content: {
        "application/json": {
          schema: z.object({ student: StudentSchema }),
        },
      },
    },
  },
});
studentRoutes.post(
  "/",
  authenticateAndSetContext,
  createStudent
);

registry.registerPath({
  description: "Actualizar datos del estudiante",
  tags: ["student"],
  method: "patch",
  path: "/student/{id}",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateStudentSchema.openapi({
            default: {
              name: "Nombre Del Estudiante",
            },
          }),
        },
      },
    },
    params: z.object({ id: z.number().positive() }),
  },
  responses: {
    200: {
      description: "Estudiante actualizado",
      content: {
        "application/json": {
          schema: z.object({ student: StudentSchema }),
        },
      },
    },
  },
});
studentRoutes.patch(
  "/:id",
  authenticateAndSetContext,
  updateStudent
);

registry.registerPath({
  description: "Eliminar estudiante",
  tags: ["student"],
  method: "delete",
  path: "/student/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({ id: z.number().positive() }),
  },
  responses: {
    200: {
      description: "Estudiante eliminado",
      content: {
        "application/json": {
          schema: z.object({ student: StudentSchema }),
        },
      },
    },
  },
});
studentRoutes.delete(
  "/:id",
  authenticateAndSetContext,
  softDeleteStudent
);

registry.registerPath({
  description: "Buscar grados de estudiantes",
  tags: ["student"],
  method: "get",
  path: "/student/studentGrades",
  security: [{ Bearer: [] }],
  request: {
    query: FindStudentByGradesQuerySchema,
  },
  responses: {
    200: {
      description: "Grados del estudiante",
      content: {
        "application/json": {
          schema: z.object({
            studentGrades: StudentGradeSchema.omit({
              schoolYearId: true,
              studentId: true,
            })
              .extend({ grade: GradeSchema })
              .array(),
          }),
        },
      },
    },
  },
});
studentRoutes.get(
  "/studentGrades",
  authenticateAndSetContext,
  findStudentGrades
);

registry.registerPath({
  description: "Ver si un estudiante está registrado en un grado específico",
  tags: ["student"],
  method: "get",
  path: "/student/hasGrade",
  security: [{ Bearer: [] }],
  request: {
    query: HasGradeQueryParamsSchema,
  },
  responses: {
    200: {
      description: "Estudiantes",
      content: {
        "application/json": {
          schema: z.object({
            hasGrade: z.boolean(),
          }),
        },
      },
    },
  },
});
studentRoutes.get(
  "/hasGrade",
  authenticateAndSetContext,
  hasGrade
);

registry.registerPath({
  description: "Obtener estudiante por id",
  tags: ["student"],
  method: "get",
  path: "/student/{id}",
  security: [{ Bearer: [] }],
  request: {
    query: FindByIdParamsSchema,
    params: z.object({ id: z.number().positive() }),
  },
  responses: {
    200: {
      description: "Estudiante",
      content: {
        "application/json": {
          schema: z.object({ student: StudentSchema }),
        },
      },
    },
  },
});
studentRoutes.get(
  "/:id",
  authenticateAndSetContext,
  findStudentById
);

registry.registerPath({
  description: "Buscar estudiantes",
  tags: ["student"],
  method: "get",
  path: "/student",
  security: [{ Bearer: [] }],
  request: {
    query: StudentSearchCriteriaQueryParamsSchema.extend(
      DefaultSearchSchema.shape
    ),
  },
  responses: {
    200: {
      description: "Estudiantes",
      content: {
        "application/json": {
          schema: ZodSearchResponseSchemaBuilder("students", StudentSchema),
        },
      },
    },
  },
});
studentRoutes.get(
  "/",
  authenticateAndSetContext,
  searchStudent
);

registry.registerPath({
  description: "Registrar estudiante a un grado",
  tags: ["student"],
  method: "post",
  path: "/student/registerStudentToGrade",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: RegisterStudentToGradeSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Estudiante registrado a un grado",
      content: {
        "application/json": {
          schema: StudentGradeSchema.openapi({}),
        },
      },
    },
  },
});
studentRoutes.post(
  "/registerStudentToGrade",
  authenticateAndSetContext,
  registerStudentToGrade
);

registry.registerPath({
  description: "Eliminar estudiante a un grado",
  tags: ["student"],
  method: "delete",
  path: "/student/unregisterStudentFromGrade/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({ id: z.number().positive() }),
  },
  responses: {
    200: {
      description: "Estudiante eliminado de un grado",
      content: {
        "application/json": {
          schema: z.object({ studentGrade: StudentGradeSchema }),
        },
      },
    },
  },
});
studentRoutes.delete(
  "/unregisterStudentFromGrade/:id",
  authenticateAndSetContext,
  unregisterStudentFromGrade
);
