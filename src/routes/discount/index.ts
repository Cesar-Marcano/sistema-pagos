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
import { applyDiscountToStudentPeriod } from "./applyDiscountToStudentPeriod";
import { unapplyDiscountFromStudentPeriod } from "./unapplyDiscountFromStudentPeriod";
import { listStudentPeriodDiscounts } from "./listStudentPeriodDiscounts";
import { getRegistry } from "../../config/openApiRegistry";
import {
  ApplyDiscountToStudentPeriodSchema,
  ApplyDiscountToStudentSchema,
  CreateDiscountSchema,
  DiscountSchema,
  DiscountSearchCriteriaQueryParams,
  StudentDiscountSchema,
  StudentPeriodDiscountSchema,
  UpdateDiscountSchema,
} from "./schemas";
import z from "zod";
import { DefaultSearchSchema } from "../../lib/searchController";
import { ZodSearchResponseSchemaBuilder } from "../../lib/zodSearchResponse";

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
  passport.authenticate("jwt", { session: false }),
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
  passport.authenticate("jwt", { session: false }),
  applyDiscountToStudent
);

registry.registerPath({
  description: "Desaplicar descuento a estudiante.",
  tags: ["discount"],
  method: "post",
  path: "/discount/unapplyDiscountFromStudent/:id",
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
  passport.authenticate("jwt", { session: false }),
  unapplyDiscountFromStudent
);

registry.registerPath({
  description: "Aplicar descuento a un periodo del estudiante.",
  tags: ["discount"],
  method: "post",
  path: "/discount/applyDiscountToStudentPeriod",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: ApplyDiscountToStudentPeriodSchema.openapi({}),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Descuento registrado",
      content: {
        "application/json": {
          schema: z.object({ discountApplied: StudentPeriodDiscountSchema }),
        },
      },
    },
  },
});
discountRoutes.post(
  "/applyDiscountToStudentPeriod",
  passport.authenticate("jwt", { session: false }),
  applyDiscountToStudentPeriod
);

registry.registerPath({
  description: "Desaplicar descuento a un periodo del estudiante.",
  tags: ["discount"],
  method: "post",
  path: "/discount/unapplyDiscountFromStudentPeriod/:id",
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
          schema: z.object({ discountUnapplied: StudentPeriodDiscountSchema }),
        },
      },
    },
  },
});
discountRoutes.delete(
  "/unapplyDiscountFromStudentPeriod/:id",
  passport.authenticate("jwt", { session: false }),
  unapplyDiscountFromStudentPeriod
);

registry.registerPath({
  description: "Listar descuentos de estudiante.",
  tags: ["discount"],
  method: "get",
  path: "/discount/studentDiscounts/:id",
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
  passport.authenticate("jwt", { session: false }),
  listStudentDiscounts
);

registry.registerPath({
  description: "Listar descuentos del periodo de un estudiante.",
  tags: ["discount"],
  method: "get",
  path: "/discount/studentPeriodDiscounts/:id",
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
          schema: z.object({
            studentDiscounts: StudentPeriodDiscountSchema.array(),
          }),
        },
      },
    },
  },
});
discountRoutes.get(
  "/studentPeriodDiscounts/:id",
  passport.authenticate("jwt", { session: false }),
  listStudentPeriodDiscounts
);

registry.registerPath({
  description: "Actualizar descuento.",
  tags: ["discount"],
  method: "patch",
  path: "/discount/:id",
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
  passport.authenticate("jwt", { session: false }),
  updateDiscount
);

registry.registerPath({
  description: "Eliminar descuento.",
  tags: ["discount"],
  method: "patch",
  path: "/discount/:id",
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
  passport.authenticate("jwt", { session: false }),
  softDeleteDiscount
);

registry.registerPath({
  description: "Obtener descuento por id.",
  tags: ["discount"],
  method: "get",
  path: "/discount/:id",
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
          schema: z.object({ studentDiscounts: DiscountSchema.array() }),
        },
      },
    },
  },
});
discountRoutes.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
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
  passport.authenticate("jwt", { session: false }),
  searchDiscount
);
