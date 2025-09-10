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
import { findStudentsByGradeAndYear } from "./findStudentsByGradeAndYear";
import { StudentSchema } from "../student/schemas";

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
    201: {
      description: "Grado registrado",
      content: {
        "application/json": {
          schema: z.object({ grade: GradeSchema }),
        },
      },
    },
  },
});
gradeRoutes.post(
  "/",
  passport.authenticate("jwt", { session: false }),
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
  },
});
gradeRoutes.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
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
  },
});
gradeRoutes.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
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
  },
});
gradeRoutes.get(
  "/findLastStudentGrade/:id",
  passport.authenticate("jwt", { session: false }),
  findLastStudentGradeById
);

registry.registerPath({
  description: "Obtener estudiantes pertenecientes a un grado",
  tags: ["grade"],
  method: "get",
  path: "/grade/findStudentsByGradeAndYear/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
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
  },
});
gradeRoutes.get(
  "/findStudentsByGradeAndYear/:id",
  passport.authenticate("jwt", { session: false }),
  findStudentsByGradeAndYear
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
  },
});
gradeRoutes.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
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
  },
});
gradeRoutes.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  searchGrade
);
