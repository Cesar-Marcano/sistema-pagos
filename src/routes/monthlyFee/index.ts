import { Router } from "express";
import passport from "passport";
import { createMonthlyFee } from "./createMonthlyFee";
import { findMonthlyFeeById } from "./findMonthlyFeeById";
import { searchMonthlyFee } from "./searchMonthlyFee";
import { updateMonthlyFee } from "./updateMonthlyFee";
import { softDeleteMonthlyFee } from "./softDeleteMonthlyFee";
import { assignFeeToGrades } from "./assignFeeToGrades";
import { unassignFeeFromGrades } from "./unassignFeeFromGrades";
import { findMonthlyFeeOnGradeById } from "./findMonthlyFeeOnGradeById";
import { searchMonthlyFeeOnGrade } from "./searchMonthlyFeeOnGrade";
import { getEffectiveMonthlyFee } from "./getEffectiveMonthlyFee";
import { getRegistry } from "../../config/openApiRegistry";
import {
  AssignFeeToGradesSchema,
  CreateMonthlyFeeSchema,
  FeeOnGradeSchema,
  GetEffectiveMonthlyFeeQueryParamsSchema,
  MonthlyFeeOnGradeSearchCriteriaQueryParams,
  MonthlyFeeSchema,
  UnassignFeeFromGradesSchema,
  UpdateMonthlyFeeSchema,
} from "./schemas";
import z from "zod";
import { DefaultSearchSchema } from "../../lib/searchController";
import { ZodSearchResponseSchemaBuilder } from "../../lib/zodSearchResponse";
import { FindByIdParamsSchema } from "../../lib/findByIdParamsSchema";
import { GradeSchema } from "../grade/schema";
import { SchoolYearSchema } from "../schoolYear/schemas";

export const monthlyFeeRoutes: Router = Router();

const registry = getRegistry();

registry.registerPath({
  description: "Registrar mensualidad.",
  tags: ["monthlyFee"],
  method: "post",
  path: "/monthlyFee",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateMonthlyFeeSchema.openapi({}),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Mensualidad registrada",
      content: {
        "application/json": {
          schema: z.object({ monthlyFee: MonthlyFeeSchema }),
        },
      },
    },
  },
});
monthlyFeeRoutes.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  createMonthlyFee
);

registry.registerPath({
  description: "Actualizar mensualidad.",
  tags: ["monthlyFee"],
  method: "patch",
  path: "/monthlyFee/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateMonthlyFeeSchema.openapi({}),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Mensualidad actualizada",
      content: {
        "application/json": {
          schema: z.object({ monthlyFee: MonthlyFeeSchema }),
        },
      },
    },
  },
});
monthlyFeeRoutes.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  updateMonthlyFee
);

registry.registerPath({
  description: "Quitar mensualidad de grados.",
  tags: ["monthlyFee"],
  method: "delete",
  path: "/monthlyFee/unassignFeeFromGrades",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UnassignFeeFromGradesSchema.openapi({}),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Mensualidad desasignada de grados",
      content: {
        "application/json": {
          schema: z.object({
            feesOnGrades: z.object({
              count: z.number().describe("Numero de grados actualizados"),
            }),
          }),
        },
      },
    },
  },
});
monthlyFeeRoutes.delete(
  "/unassignFeeFromGrades",
  passport.authenticate("jwt", { session: false }),
  unassignFeeFromGrades
);

registry.registerPath({
  description: "Quitar mensualidad de grados.",
  tags: ["monthlyFee"],
  method: "delete",
  path: "/monthlyFee/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number(),
    }),
  },
  responses: {
    200: {
      description: "Mensualidad eliminada",
      content: {
        "application/json": {
          schema: MonthlyFeeSchema,
        },
      },
    },
  },
});
monthlyFeeRoutes.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  softDeleteMonthlyFee
);

registry.registerPath({
  description: "Buscar mensualidades aplicadas a grados",
  tags: ["monthlyFee"],
  method: "get",
  path: "/payment/feeOnGrade/search",
  security: [{ Bearer: [] }],
  request: {
    query: MonthlyFeeOnGradeSearchCriteriaQueryParams.extend(
      DefaultSearchSchema.shape
    ),
  },
  responses: {
    200: {
      description: "Mensualidades aplicadas a grados",
      content: {
        "application/json": {
          schema: ZodSearchResponseSchemaBuilder(
            "feeOnGrades",
            FeeOnGradeSchema
          ),
        },
      },
    },
  },
});
monthlyFeeRoutes.get(
  "/feeOnGrade/search",
  passport.authenticate("jwt", { session: false }),
  searchMonthlyFeeOnGrade
);

registry.registerPath({
  description: "Buscar mensualidad aplicada a grado",
  tags: ["monthlyFee"],
  method: "get",
  path: "/payment/feeOnGrade/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
    }),
    query: FindByIdParamsSchema,
  },
  responses: {
    200: {
      description: "Mensualidad aplicada a grado",
      content: {
        "application/json": {
          schema: FeeOnGradeSchema,
        },
      },
    },
  },
});
monthlyFeeRoutes.get(
  "/feeOnGrade/:id",
  passport.authenticate("jwt", { session: false }),
  findMonthlyFeeOnGradeById
);

registry.registerPath({
  description: "Buscar mensualidad vigente para un grado",
  tags: ["monthlyFee"],
  method: "get",
  path: "/payment/feeOnGrade/getEffectiveMonthlyFee",
  security: [{ Bearer: [] }],
  request: {
    query: GetEffectiveMonthlyFeeQueryParamsSchema,
  },
  responses: {
    200: {
      description: "Mensualidad aplicada a grado",
      content: {
        "application/json": {
          schema: FeeOnGradeSchema.and(
            z.object({
              monthlyFee: MonthlyFeeSchema,
              grade: GradeSchema,
              effectiveFromPeriod: z.object({
                schoolYear: SchoolYearSchema,
              }),
            })
          ),
        },
      },
    },
  },
});
monthlyFeeRoutes.get(
  "/feeOnGrade/getEffectiveMonthlyFee",
  passport.authenticate("jwt", { session: false }),
  getEffectiveMonthlyFee
);

registry.registerPath({
  description: "Buscar mensualidad",
  tags: ["monthlyFee"],
  method: "get",
  path: "/payment/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
    }),
    query: FindByIdParamsSchema,
  },
  responses: {
    200: {
      description: "Mensualidad",
      content: {
        "application/json": {
          schema: MonthlyFeeSchema,
        },
      },
    },
  },
});
monthlyFeeRoutes.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  findMonthlyFeeById
);

registry.registerPath({
  description: "Buscar mensualidad",
  tags: ["monthlyFee"],
  method: "get",
  path: "/payment",
  security: [{ Bearer: [] }],
  request: {
    query: MonthlyFeeOnGradeSearchCriteriaQueryParams.extend(
      DefaultSearchSchema.shape
    ),
  },
  responses: {
    200: {
      description: "Mensualidades",
      content: {
        "application/json": {
          schema: ZodSearchResponseSchemaBuilder(
            "monthlyFees",
            MonthlyFeeSchema
          ),
        },
      },
    },
  },
});
monthlyFeeRoutes.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  searchMonthlyFee
);

registry.registerPath({
  description: "Aplicar mensualidad a grados",
  tags: ["monthlyFee"],
  method: "get",
  path: "/payment",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: AssignFeeToGradesSchema.openapi({}),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Mensualidades enlazadas",
      content: {
        "application/json": {
          schema: z.object({
            feesOnGrades: z.object({
              count: z.number(),
            }),
          }),
        },
      },
    },
  },
});
monthlyFeeRoutes.post(
  "/assignFeeToGrades",
  passport.authenticate("jwt", { session: false }),
  assignFeeToGrades
);
