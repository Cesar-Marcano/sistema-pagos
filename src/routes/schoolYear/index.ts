import { Router } from "express";
import passport from "passport";
import { createSchoolYear } from "./createSchoolYear";
import { updateSchoolYear } from "./updateSchoolYear";
import { softDeleteSchoolYear } from "./softDeleteSchoolYear";
import { findSchoolYearById } from "./findSchoolYearById";
import { searchSchoolYear } from "./searchSchoolYear";
import { getRegistry } from "../../config/openApiRegistry";
import {
  CreateSchoolYearSchema,
  SchoolYearSchema,
  SchoolYearSearchCriteriaQueryParamsSchema,
  UpdateSchoolYearSchema,
} from "./schemas";
import z from "zod";
import { FindByIdParamsSchema } from "../../lib/findByIdParamsSchema";
import { DefaultSearchSchema } from "../../lib/searchController";
import { ZodSearchResponseSchemaBuilder } from "../../lib/zodSearchResponse";
import { authenticateAndSetContext } from "../../middlewares/authenticateAndSetContext";

export const schoolYearRoutes: Router = Router();

const registry = getRegistry();

registry.registerPath({
  description: "Registrar año escolar",
  tags: ["schoolYear"],
  method: "post",
  path: "/schoolYear",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateSchoolYearSchema.openapi({}),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Año escolar registrado",
      content: {
        "application/json": {
          schema: z.object({ schoolYear: SchoolYearSchema }),
        },
      },
    },
  },
});
schoolYearRoutes.post(
  "/",
  authenticateAndSetContext,
  createSchoolYear
);

registry.registerPath({
  description: "Actualizar año escolar",
  tags: ["schoolYear"],
  method: "patch",
  path: "/schoolYear/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateSchoolYearSchema.openapi({}),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Año escolar actualizado",
      content: {
        "application/json": {
          schema: z.object({ schoolYear: SchoolYearSchema }),
        },
      },
    },
  },
});
schoolYearRoutes.patch(
  "/:id",
  authenticateAndSetContext,
  updateSchoolYear
);

registry.registerPath({
  description: "Elimina año escolar",
  tags: ["schoolYear"],
  method: "delete",
  path: "/schoolYear/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
    }),
  },
  responses: {
    200: {
      description: "Año escolar eliminado",
      content: {
        "application/json": {
          schema: z.object({ schoolYear: SchoolYearSchema }),
        },
      },
    },
  },
});
schoolYearRoutes.delete(
  "/:id",
  authenticateAndSetContext,
  softDeleteSchoolYear
);

registry.registerPath({
  description: "Obtiene año escolar por id",
  tags: ["schoolYear"],
  method: "get",
  path: "/schoolYear/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
    }),
    query: FindByIdParamsSchema,
  },
  responses: {
    200: {
      description: "Año escolar",
      content: {
        "application/json": {
          schema: z.object({ schoolYear: SchoolYearSchema }),
        },
      },
    },
  },
});
schoolYearRoutes.get(
  "/:id",
  authenticateAndSetContext,
  findSchoolYearById
);

registry.registerPath({
  description: "Buscar años escolares",
  tags: ["schoolYear"],
  method: "get",
  path: "/schoolYear",
  security: [{ Bearer: [] }],
  request: {
    query: SchoolYearSearchCriteriaQueryParamsSchema.extend(
      DefaultSearchSchema.shape
    ),
  },
  responses: {
    200: {
      description: "Años escolares",
      content: {
        "application/json": {
          schema: ZodSearchResponseSchemaBuilder("students", SchoolYearSchema),
        },
      },
    },
  },
});
schoolYearRoutes.get(
  "/",
  authenticateAndSetContext,
  searchSchoolYear
);
