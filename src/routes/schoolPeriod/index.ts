import { Router } from "express";
import passport from "passport";
import { createSchoolPeriod } from "./createSchoolPeriod";
import { updateSchoolPeriod } from "./updateSchoolPeriod";
import { softDeleteSchoolPeriod } from "./softDeleteSchoolPeriod";
import { findSchoolPeriodById } from "./findSchoolPeriodById";
import { searchSchoolPeriod } from "./searchSchoolPeriod";
import { getRegistry } from "../../config/openApiRegistry";
import {
  CreateSchoolPeriodSchema,
  SchoolPeriodSchema,
  SchoolPeriodSearchCriteriaQueryParamsSchema,
  UpdateSchoolPeriodSchema,
} from "./schemas";
import z from "zod";
import { FindByIdParamsSchema } from "../../lib/findByIdParamsSchema";
import { DefaultSearchSchema } from "../../lib/searchController";
import { ZodSearchResponseSchemaBuilder } from "../../lib/zodSearchResponse";
import { authenticateAndSetContext } from "../../middlewares/authenticateAndSetContext";

export const schoolPeriodRoutes: Router = Router();

const registry = getRegistry();

registry.registerPath({
  description: "Registrar periodo escolar",
  tags: ["schoolPeriod"],
  method: "post",
  path: "/schoolPeriod",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateSchoolPeriodSchema.openapi({}),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Período escolar registrado",
      content: {
        "application/json": {
          schema: z.object({ schoolPeriod: SchoolPeriodSchema }),
        },
      },
    },
  },
});
schoolPeriodRoutes.post(
  "/",
  authenticateAndSetContext,
  createSchoolPeriod
);

registry.registerPath({
  description: "Actualizar periodo escolar",
  tags: ["schoolPeriod"],
  method: "patch",
  path: "/schoolPeriod/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateSchoolPeriodSchema.openapi({}),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Período escolar actualizado",
      content: {
        "application/json": {
          schema: z.object({ schoolPeriod: SchoolPeriodSchema }),
        },
      },
    },
  },
});
schoolPeriodRoutes.patch(
  "/:id",
  authenticateAndSetContext,
  updateSchoolPeriod
);

registry.registerPath({
  description: "Elimina periodo escolar",
  tags: ["schoolPeriod"],
  method: "delete",
  path: "/schoolPeriod/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
    }),
  },
  responses: {
    200: {
      description: "Período escolar eliminado",
      content: {
        "application/json": {
          schema: z.object({ schoolPeriod: SchoolPeriodSchema }),
        },
      },
    },
  },
});
schoolPeriodRoutes.delete(
  "/:id",
  authenticateAndSetContext,
  softDeleteSchoolPeriod
);

registry.registerPath({
  description: "Obtiene periodo escolar por id",
  tags: ["schoolPeriod"],
  method: "get",
  path: "/schoolPeriod/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
    }),
    query: FindByIdParamsSchema,
  },
  responses: {
    200: {
      description: "Período escolar",
      content: {
        "application/json": {
          schema: z.object({ schoolPeriod: SchoolPeriodSchema }),
        },
      },
    },
  },
});
schoolPeriodRoutes.get(
  "/:id",
  authenticateAndSetContext,
  findSchoolPeriodById
);

registry.registerPath({
  description: "Buscar periodos escolares",
  tags: ["schoolPeriod"],
  method: "get",
  path: "/schoolPeriod",
  security: [{ Bearer: [] }],
  request: {
    query: SchoolPeriodSearchCriteriaQueryParamsSchema.extend(
      DefaultSearchSchema.shape
    ),
  },
  responses: {
    200: {
      description: "Períodos escolares",
      content: {
        "application/json": {
          schema: ZodSearchResponseSchemaBuilder("schoolPeriods", SchoolPeriodSchema),
        },
      },
    },
  },
});
schoolPeriodRoutes.get(
  "/",
  authenticateAndSetContext,
  searchSchoolPeriod
);
