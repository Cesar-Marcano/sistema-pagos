import { Router } from "express";
import passport from "passport";
import { createPayment } from "./createPayment";
import { findPaymentById } from "./findPaymentById";
import { searchPayment } from "./searchPayment";
import { updatePayment } from "./updatePayment";
import { softDeletePayment } from "./softDeletePayment";
import { getRegistry } from "../../config/openApiRegistry";
import { CreatePaymentSchema, PaymentSchema, PaymentSearchCriteriaQueryParamsSchema, UpdatePaymentSchema } from "./schemas";
import z from "zod";
import { FindByIdParamsSchema } from "../../lib/findByIdParamsSchema";
import { DefaultSearchSchema } from "../../lib/searchController";
import { ZodSearchResponseSchemaBuilder } from "../../lib/zodSearchResponse";
import { PaymentMethodSchema } from "../paymentMethod/schemas";

export const paymentRoutes: Router = Router();

const registry = getRegistry();

registry.registerPath({
  description: "Registrar pago.",
  tags: ["payment"],
  method: "post",
  path: "/payment",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreatePaymentSchema.openapi({}),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Pago registrado",
      content: {
        "application/json": {
          schema: z.object({ payment: PaymentSchema }),
        },
      },
    },
  },
});
paymentRoutes.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  createPayment
);

registry.registerPath({
  description: "Actualizar pago",
  tags: ["payment"],
  method: "patch",
  path: "/payment/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdatePaymentSchema.openapi({}),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Pago actualizado",
      content: {
        "application/json": {
          schema: z.object({ payment: PaymentSchema }),
        },
      },
    },
  },
});
paymentRoutes.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  updatePayment
);

registry.registerPath({
  description: "Eliminar pago",
  tags: ["payment"],
  method: "delete",
  path: "/payment/{id}",
  security: [{ Bearer: [] }],
  request: {
    params: z.object({
      id: z.number().positive(),
    }),
  },
  responses: {
    200: {
      description: "Pago eliminado",
      content: {
        "application/json": {
          schema: z.object({ payment: PaymentSchema }),
        },
      },
    },
  },
});
paymentRoutes.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  softDeletePayment
);

registry.registerPath({
  description: "Obtener pago por id",
  tags: ["payment"],
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
      description: "Pago",
      content: {
        "application/json": {
          schema: z.object({ payment: PaymentSchema }),
        },
      },
    },
  },
});
paymentRoutes.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  findPaymentById
);

registry.registerPath({
  description: "Buscar pagos",
  tags: ["payment"],
  method: "get",
  path: "/payment",
  security: [{ Bearer: [] }],
  request: {
    query: PaymentSearchCriteriaQueryParamsSchema.extend(
      DefaultSearchSchema.shape
    ),
  },
  responses: {
    200: {
      description: "Pagos",
      content: {
        "application/json": {
          schema: ZodSearchResponseSchemaBuilder(
            "payments",
            PaymentMethodSchema
          ),
        },
      },
    },
  },
});
paymentRoutes.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  searchPayment
);
