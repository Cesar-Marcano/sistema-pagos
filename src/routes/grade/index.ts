import { Router } from "express";
import passport from "passport";
import { createGrade } from "./createGrade";
import { findGradeById } from "./findGradeById";
import { searchGrade } from "./searchGrade";
import { updateGrade } from "./updateGrade";
import { softDeleteGrade } from "./softDeleteGrade";
import z from "zod";
import { getRegistry } from "../../config/openApiRegistry";
import { CreateGradeSchema, GradeSchema, GradeSearchCriteriaQueryParams, UpdateGradeSchema } from "./schemas";
import { FindByIdParamsSchema } from "../../lib/findByIdParamsSchema";
import { DefaultSearchSchema } from "../../lib/searchController";
import { ZodSearchResponseSchemaBuilder } from "../../lib/zodSearchResponse";
import { findLastStudentGradeById } from "./findLastStudentGrade";
import { findStudentsInGrade } from "./findStudentsInGrade";
import { StudentSchema } from "../student/schemas";
import { authenticateAndSetContext } from "../../middlewares/authenticateAndSetContext";

export const gradeRoutes: Router = Router();

const registry = getRegistry();

registry.registerPath({
  description: "Registrar grado.",
  tags: ["grade"],
  method: "post",
  path: "/grade",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateGradeSchema.openapi({}),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Grado registrado",
      content: {
        "application/json": {
          schema: z.object({ grade: GradeSchema }),
        },
      },
    },
    400: {
      description: "Datos de entrada inválidos",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    401: {
      description: "No autenticado",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    409: {
      description: "Grado ya existe",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    500: {
      description: "Error interno del servidor",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
  },
});
gradeRoutes.post(
  "/",
  authenticateAndSetContext,
  createGrade
);

registry.registerPath({
  description: "Actualizar grado",
  tags: ["grade"],
  method: "patch",
  path: "/grade/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateGradeSchema.openapi({}),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Grado actualizado",
      content: {
        "application/json": {
          schema: z.object({ grade: GradeSchema }),
        },
      },
    },
    400: {
      description: "Datos de entrada inválidos",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    401: {
      description: "No autenticado",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    404: {
      description: "Grado no encontrado",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    500: {
      description: "Error interno del servidor",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
  },
});
gradeRoutes.patch(
  "/:id",
  authenticateAndSetContext,
  updateGrade
);

registry.registerPath({
  description: "Eliminar grado",
  tags: ["grade"],
  method: "delete",
  path: "/grade/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
    }),
  },
  responses: {
    200: {
      description: "Grado eliminado",
      content: {
        "application/json": {
          schema: z.object({ grade: GradeSchema }),
        },
      },
    },
    401: {
      description: "No autenticado",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    404: {
      description: "Grado no encontrado",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    500: {
      description: "Error interno del servidor",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
  },
});
gradeRoutes.delete(
  "/:id",
  authenticateAndSetContext,
  softDeleteGrade
);

registry.registerPath({
  description: "Obtener ultimo grado de estudiante por id",
  tags: ["grade"],
  method: "get",
  path: "/grade/findLastStudentGrade/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
    })
  },
  responses: {
    200: {
      description: "Grado",
      content: {
        "application/json": {
          schema: z.object({ grade: GradeSchema }),
        },
      },
    },
    400: {
      description: "Parámetros de consulta inválidos",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    401: {
      description: "No autenticado",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    404: {
      description: "Estudiante no encontrado",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    500: {
      description: "Error interno del servidor",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
  },
});
gradeRoutes.get(
  "/findLastStudentGrade/:id",
  authenticateAndSetContext,
  findLastStudentGradeById
);

registry.registerPath({
  description: "Obtener estudiantes pertenecientes a un grado en un año",
  tags: ["grade"],
  method: "get",
  path: "/grade/findStudentsInGrade/grade/{gradeId}/schoolYear/{schoolYearId}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      gradeId: z.number().positive(),
      schoolYearId: z.number().positive(),
    })
  },
  responses: {
    200: {
      description: "Estudiantes",
      content: {
        "application/json": {
          schema: z.object({ students: StudentSchema.array() }),
        },
      },
    },
    400: {
      description: "Parámetros de consulta inválidos",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    401: {
      description: "No autenticado",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    404: {
      description: "Grado o año escolar no encontrado",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    500: {
      description: "Error interno del servidor",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
  },
});
gradeRoutes.get(
  "/findStudentsInGrade/grade/:gradeId/schoolYear/:schoolYearId",
  authenticateAndSetContext,
  findStudentsInGrade
);

registry.registerPath({
  description: "Obtener grado por id",
  tags: ["grade"],
  method: "get",
  path: "/grade/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
    }),
    query: FindByIdParamsSchema,
  },
  responses: {
    200: {
      description: "Grado",
      content: {
        "application/json": {
          schema: z.object({ grade: GradeSchema }),
        },
      },
    },
    400: {
      description: "Parámetros de consulta inválidos",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    401: {
      description: "No autenticado",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    404: {
      description: "Grado no encontrado",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    500: {
      description: "Error interno del servidor",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
  },
});
gradeRoutes.get(
  "/:id",
  authenticateAndSetContext,
  findGradeById
);


registry.registerPath({
  description: "Buscar grados",
  tags: ["grade"],
  method: "get",
  path: "/grade",
  security: [{ Bearer: [] }],
  request: {
    query: GradeSearchCriteriaQueryParams.extend(
      DefaultSearchSchema.shape
    ),
  },
  responses: {
    200: {
      description: "Grados",
      content: {
        "application/json": {
          schema: ZodSearchResponseSchemaBuilder(
            "grades",
            GradeSchema
          ),
        },
      },
    },
    400: {
      description: "Parámetros de consulta inválidos",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    401: {
      description: "No autenticado",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    500: {
      description: "Error interno del servidor",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
  },
});
gradeRoutes.get(
  "/",
  authenticateAndSetContext,
  searchGrade
);
