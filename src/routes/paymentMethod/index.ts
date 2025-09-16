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
import { authenticateAndSetContext } from "../../middlewares/authenticateAndSetContext";

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
      description: "Método de pago ya existe",
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
paymentMethodRoutes.post(
  "/",
  authenticateAndSetContext,
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
      description: "Método de pago no encontrado",
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
paymentMethodRoutes.patch(
  "/:id",
  authenticateAndSetContext,
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
      description: "Método de pago no encontrado",
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
paymentMethodRoutes.delete(
  "/:id",
  authenticateAndSetContext,
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
      description: "Método de pago no encontrado",
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
paymentMethodRoutes.get(
  "/:id",
  authenticateAndSetContext,
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
paymentMethodRoutes.get(
  "/",
  authenticateAndSetContext,
  searchPaymentMethod
);
