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
import { ZodSearchResponseSchemaBuilder } from "../../lib/zodSearchResponse";
import { DefaultSearchSchema } from "../../lib/searchController";

export const schoolPeriodRoutes: Router = Router();

const registry = getRegistry();

registry.registerPath({
  description: "Registrar periodo (mes) escolar.",
  tags: ["schoolPeriod"],
  method: "post",
  path: "/schoolPeriod",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateSchoolPeriodSchema.openapi({}).extend({
            monthNumber: z
              .number()
              .positive()
              .describe(
                "El número del mes es relativo al año escolar. El mes 1 equivale al mes de inicio del año escolar. Es un número entre 1 y el numero de meses totales del año escolar."
              ),
            name: z
              .string()
              .optional()
              .describe("Nombre opcional para el periodo. Ej: 'Mayo 2025'"),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Periodo escolar registrado",
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
  passport.authenticate("jwt", { session: false }),
  createSchoolPeriod
);

registry.registerPath({
  description: "Actualizar periodo (mes) escolar",
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
      description: "Periodo escolar actualizado",
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
  passport.authenticate("jwt", { session: false }),
  updateSchoolPeriod
);

registry.registerPath({
  description: "Eliminar periodo (mes) escolar",
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
      description: "Periodo escolar eliminado",
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
  passport.authenticate("jwt", { session: false }),
  softDeleteSchoolPeriod
);

registry.registerPath({
  description: "Obtener periodo (mes) escolar por id",
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
      description: "Periodo escolar",
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
  passport.authenticate("jwt", { session: false }),
  findSchoolPeriodById
);

registry.registerPath({
  description: "Buscar periodos (meses) escolares",
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
      description: "Periodo escolar",
      content: {
        "application/json": {
          schema: ZodSearchResponseSchemaBuilder(
            "schoolPeriods",
            SchoolPeriodSchema
          ),
        },
      },
    },
  },
});
schoolPeriodRoutes.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  searchSchoolPeriod
);
