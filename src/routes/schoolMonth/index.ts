import { Router } from "express";
import passport from "passport";
import { createSchoolMonth } from "./createSchoolMonth";
import { updateSchoolMonth } from "./updateSchoolMonth";
import { softDeleteSchoolMonth } from "./softDeleteSchoolMonth";
import { findSchoolMonthById } from "./findSchoolMonthById";
import { searchSchoolMonth } from "./searchSchoolMonth";
import { getRegistry } from "../../config/openApiRegistry";
import {
  CreateSchoolMonthSchema,
  SchoolMonthSchema,
  SchoolMonthSearchCriteriaQueryParamsSchema,
  UpdateSchoolMonthSchema,
} from "./schemas";
import z from "zod";
import { FindByIdParamsSchema } from "../../lib/findByIdParamsSchema";
import { ZodSearchResponseSchemaBuilder } from "../../lib/zodSearchResponse";
import { DefaultSearchSchema } from "../../lib/searchController";
import { authenticateAndSetContext } from "../../middlewares/authenticateAndSetContext";

export const schoolMonthRoutes: Router = Router();

const registry = getRegistry();

registry.registerPath({
  description: "Registrar mes escolar.",
  tags: ["schoolMonth"],
  method: "post",
  path: "/schoolMonth",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateSchoolMonthSchema.openapi({}).extend({
            schoolPeriodId: z
              .number()
              .positive()
              .describe("ID del período escolar al que pertenece este mes"),
            month: z
              .number()
              .positive()
              .describe(
                "El número del mes es relativo al año escolar. El mes 1 equivale al mes de inicio del año escolar. Es un número entre 1 y el numero de meses totales del año escolar."
              ),
            name: z
              .string()
              .optional()
              .describe("Nombre opcional para el mes escolar. Ej: 'Mayo 2025'"),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Mes escolar registrado",
      content: {
        "application/json": {
          schema: z.object({ schoolMonth: SchoolMonthSchema }),
        },
      },
    },
  },
});
schoolMonthRoutes.post("/", authenticateAndSetContext, createSchoolMonth);

registry.registerPath({
  description: "Actualizar mes escolar",
  tags: ["schoolMonth"],
  method: "patch",
  path: "/schoolMonth/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateSchoolMonthSchema.openapi({}),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Mes escolar actualizado",
      content: {
        "application/json": {
          schema: z.object({ schoolMonth: SchoolMonthSchema }),
        },
      },
    },
  },
});
schoolMonthRoutes.patch("/:id", authenticateAndSetContext, updateSchoolMonth);

registry.registerPath({
  description: "Eliminar mes escolar",
  tags: ["schoolMonth"],
  method: "delete",
  path: "/schoolMonth/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
    }),
  },
  responses: {
    200: {
      description: "Mes escolar eliminado",
      content: {
        "application/json": {
          schema: z.object({ schoolMonth: SchoolMonthSchema }),
        },
      },
    },
  },
});
schoolMonthRoutes.delete(
  "/:id",
  authenticateAndSetContext,
  softDeleteSchoolMonth
);

registry.registerPath({
  description: "Obtener mes escolar por id",
  tags: ["schoolMonth"],
  method: "get",
  path: "/schoolMonth/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
    }),
    query: FindByIdParamsSchema,
  },
  responses: {
    200: {
      description: "Mes escolar",
      content: {
        "application/json": {
          schema: z.object({ schoolMonth: SchoolMonthSchema }),
        },
      },
    },
  },
});
schoolMonthRoutes.get("/:id", authenticateAndSetContext, findSchoolMonthById);

registry.registerPath({
  description: "Buscar meses escolares",
  tags: ["schoolMonth"],
  method: "get",
  path: "/schoolMonth",
  security: [{ Bearer: [] }],
  request: {
    query: SchoolMonthSearchCriteriaQueryParamsSchema.extend(
      DefaultSearchSchema.shape
    ),
  },
  responses: {
    200: {
      description: "Mes escolar",
      content: {
        "application/json": {
          schema: ZodSearchResponseSchemaBuilder(
            "schoolMonths",
            SchoolMonthSchema
          ),
        },
      },
    },
  },
});
schoolMonthRoutes.get("/", authenticateAndSetContext, searchSchoolMonth);
