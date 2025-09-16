import { Router } from "express";
import passport from "passport";
import { createDiscount } from "./createDiscount";
import { findDiscountById } from "./findDiscountById";
import { searchDiscount } from "./searchDiscount";
import { updateDiscount } from "./updateDiscount";
import { softDeleteDiscount } from "./softDeleteDiscount";
import { applyDiscountToStudent } from "./applyDiscountToStudent";
import { unapplyDiscountFromStudent } from "./unapplyDiscountFromStudent";
import { listStudentDiscounts } from "./listStudentDiscounts";
import { applyDiscountToStudentMonth } from "./applyDiscountToStudentMonth";
import { unapplyDiscountFromStudentMonth } from "./unapplyDiscountFromStudentMonth";
import { listStudentMonthDiscounts } from "./listStudentMonthDiscounts";
import { getRegistry } from "../../config/openApiRegistry";
import {
  ApplyDiscountToStudentMonthSchema,
  ApplyDiscountToStudentSchema,
  CreateDiscountSchema,
  DiscountSchema,
  DiscountSearchCriteriaQueryParams,
  StudentDiscountSchema,
  StudentMonthDiscountSchema,
  UpdateDiscountSchema,
} from "./schemas";
import z from "zod";
import { DefaultSearchSchema } from "../../lib/searchController";
import { ZodSearchResponseSchemaBuilder } from "../../lib/zodSearchResponse";
import { authenticateAndSetContext } from "../../middlewares/authenticateAndSetContext";

export const discountRoutes: Router = Router();

const registry = getRegistry();

registry.registerPath({
  description: "Registrar descuento.",
  tags: ["discount"],
  method: "post",
  path: "/discount",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateDiscountSchema.openapi({}),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Descuento registrado",
      content: {
        "application/json": {
          schema: z.object({ discount: DiscountSchema }),
        },
      },
    },
  },
});
discountRoutes.post(
  "/",
  authenticateAndSetContext,
  createDiscount
);

registry.registerPath({
  description: "Aplicar descuento a estudiante.",
  tags: ["discount"],
  method: "post",
  path: "/discount/applyDiscountToStudent",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ApplyDiscountToStudentSchema.openapi({}),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Descuento registrado",
      content: {
        "application/json": {
          schema: z.object({ discountApplied: StudentDiscountSchema }),
        },
      },
    },
  },
});
discountRoutes.post(
  "/applyDiscountToStudent",
  authenticateAndSetContext,
  applyDiscountToStudent
);

registry.registerPath({
  description: "Desaplicar descuento a estudiante.",
  tags: ["discount"],
  method: "post",
  path: "/discount/unapplyDiscountFromStudent/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
    }),
  },
  responses: {
    200: {
      description: "Descuento desaplicado",
      content: {
        "application/json": {
          schema: z.object({ discountUnapplied: StudentDiscountSchema }),
        },
      },
    },
  },
});
discountRoutes.delete(
  "/unapplyDiscountFromStudent/:id",
  authenticateAndSetContext,
  unapplyDiscountFromStudent
);

registry.registerPath({
  description: "Aplicar descuento a un schoolMonthscolar del estudiante.",
  tags: ["discount"],
  method: "post",
  path: "/discount/applyDiscountToStudentMonth",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ApplyDiscountToStudentMonthSchema.openapi({}),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Descuento registrado",
      content: {
        "application/json": {
          schema: z.object({ discountApplied: StudentMonthDiscountSchema }),
        },
      },
    },
  },
});
discountRoutes.post(
  "/applyDiscountToStudentMonth",
  authenticateAndSetContext,
  applyDiscountToStudentMonth
);

registry.registerPath({
  description: "Desaplicar descuento a un schoolMonthscolar del estudiante.",
  tags: ["discount"],
  method: "post",
  path: "/discount/unapplyDiscountFromStudentMonth/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
    }),
  },
  responses: {
    200: {
      description: "Descuento desaplicado",
      content: {
        "application/json": {
          schema: z.object({ discountUnapplied: StudentMonthDiscountSchema }),
        },
      },
    },
  },
});
discountRoutes.delete(
  "/unapplyDiscountFromStudentMonth/:id",
  authenticateAndSetContext,
  unapplyDiscountFromStudentMonth
);

registry.registerPath({
  description: "Listar descuentos de estudiante.",
  tags: ["discount"],
  method: "get",
  path: "/discount/studentDiscounts/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
    }),
  },
  responses: {
    200: {
      description: "Descuentos",
      content: {
        "application/json": {
          schema: z.object({ studentDiscounts: StudentDiscountSchema.array() }),
        },
      },
    },
  },
});
discountRoutes.get(
  "/studentDiscounts/:id",
  authenticateAndSetContext,
  listStudentDiscounts
);

registry.registerPath({
  description: "Listar descuentos del schoolMonthscolar de un estudiante.",
  tags: ["discount"],
  method: "get",
  path: "/studentMonthDiscounts/student/{studentId}/schoolMonth/{schoolMonthId}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      studentId: z.number().positive(),
      schoolMonthId: z.number().positive(),
    }),
  },
  responses: {
    200: {
      description: "Descuentos",
      content: {
        "application/json": {
          schema: z.object({
            studentDiscounts: StudentMonthDiscountSchema.array(),
          }),
        },
      },
    },
  },
});
discountRoutes.get(
  "/studentMonthDiscounts/student/:studentId/schoolMonth/:schoolMonthId",
  authenticateAndSetContext,
  listStudentMonthDiscounts
);

registry.registerPath({
  description: "Actualizar descuento.",
  tags: ["discount"],
  method: "patch",
  path: "/discount/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateDiscountSchema.openapi({}),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Descuento",
      content: {
        "application/json": {
          schema: z.object({ discount: DiscountSchema }),
        },
      },
    },
  },
});
discountRoutes.patch(
  "/:id",
  authenticateAndSetContext,
  updateDiscount
);

registry.registerPath({
  description: "Eliminar descuento.",
  tags: ["discount"],
  method: "delete",
  path: "/discount/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
    }),
  },
  responses: {
    200: {
      description: "Descuento",
      content: {
        "application/json": {
          schema: z.object({ discount: DiscountSchema }),
        },
      },
    },
  },
});
discountRoutes.delete(
  "/:id",
  authenticateAndSetContext,
  softDeleteDiscount
);

registry.registerPath({
  description: "Obtener descuento por id.",
  tags: ["discount"],
  method: "get",
  path: "/discount/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
    }),
  },
  responses: {
    200: {
      description: "Descuento",
      content: {
        "application/json": {
          schema: z.object({ discount: DiscountSchema }),
        },
      },
    },
  },
});
discountRoutes.get(
  "/:id",
  authenticateAndSetContext,
  findDiscountById
);

registry.registerPath({
  description: "Buscar descuentos.",
  tags: ["discount"],
  method: "get",
  path: "/discount",
  security: [{ Bearer: [] }],
  request: {
    query: DiscountSearchCriteriaQueryParams.extend(DefaultSearchSchema.shape),
  },
  responses: {
    200: {
      description: "Descuentos",
      content: {
        "application/json": {
          schema: ZodSearchResponseSchemaBuilder("discounts", DiscountSchema),
        },
      },
    },
  },
});
discountRoutes.get(
  "/",
  authenticateAndSetContext,
  searchDiscount
);
