import { Router } from "express";
import passport from "passport";
import { createPaymentMethod } from "./createPaymentMethod";
import { findPaymentMethodById } from "./findPaymentMethodById";
import { searchPaymentMethod } from "./searchPaymentMethod";
import { updatePaymentMethod } from "./updatePaymentMethod";
import { softDeletePaymentMethod } from "./softDeletePaymentMethod";
import { getRegistry } from "../../config/openApiRegistry";
import {
  CreatePaymentMethodSchema,
  PaymentMethodSchema,
  PaymentMethodSearchCriteriaQueryParams,
  UpdatePaymentMethodSchema,
} from "./schemas";
import z from "zod";
import { FindByIdParamsSchema } from "../../lib/findByIdParamsSchema";
import { DefaultSearchSchema } from "../../lib/searchController";
import { ZodSearchResponseSchemaBuilder } from "../../lib/zodSearchResponse";

export const paymentMethodRoutes: Router = Router();

const registry = getRegistry();

registry.registerPath({
  description: "Registrar método de pago.",
  tags: ["paymentMethod"],
  method: "post",
  path: "/paymentMethod",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreatePaymentMethodSchema.openapi({}),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Método de pago registrado",
      content: {
        "application/json": {
          schema: z.object({ paymentMethod: PaymentMethodSchema }),
        },
      },
    },
  },
});
paymentMethodRoutes.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  createPaymentMethod
);

registry.registerPath({
  description: "Actualizar método de pago",
  tags: ["paymentMethod"],
  method: "patch",
  path: "/paymentMethod/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdatePaymentMethodSchema.openapi({}),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Método de pago actualizado",
      content: {
        "application/json": {
          schema: z.object({ paymentMethod: PaymentMethodSchema }),
        },
      },
    },
  },
});
paymentMethodRoutes.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  updatePaymentMethod
);

registry.registerPath({
  description: "Eliminar método de pago",
  tags: ["paymentMethod"],
  method: "delete",
  path: "/paymentMethod/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
    }),
  },
  responses: {
    200: {
      description: "Método de pago eliminado",
      content: {
        "application/json": {
          schema: z.object({ paymentMethod: PaymentMethodSchema }),
        },
      },
    },
  },
});
paymentMethodRoutes.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  softDeletePaymentMethod
);

registry.registerPath({
  description: "Obtener método de pago por id",
  tags: ["paymentMethod"],
  method: "get",
  path: "/paymentMethod/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
    }),
    query: FindByIdParamsSchema,
  },
  responses: {
    200: {
      description: "Método de pago",
      content: {
        "application/json": {
          schema: z.object({ paymentMethod: PaymentMethodSchema }),
        },
      },
    },
  },
});
paymentMethodRoutes.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  findPaymentMethodById
);

registry.registerPath({
  description: "Buscar métodos de pago",
  tags: ["paymentMethod"],
  method: "get",
  path: "/paymentMethod",
  security: [{ Bearer: [] }],
  request: {
    query: PaymentMethodSearchCriteriaQueryParams.extend(
      DefaultSearchSchema.shape
    ),
  },
  responses: {
    200: {
      description: "Métodos de pago",
      content: {
        "application/json": {
          schema: ZodSearchResponseSchemaBuilder(
            "paymentMethods",
            PaymentMethodSchema
          ),
        },
      },
    },
  },
});
paymentMethodRoutes.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  searchPaymentMethod
);
