import { Router } from "express";
import { getSetting } from "./getSetting";
import { setSetting } from "./setSetting";
import { getRegistry } from "../../config/openApiRegistry";
import { UpsertSettingSchema, SettingSchema, GetSettingParamsSchema } from "./schemas";
import z from "zod";
import { authenticateAndSetContext } from "../../middlewares/authenticateAndSetContext";

export const configRoutes: Router = Router();

const registry = getRegistry();

registry.registerPath({
  description: "Configurar valor de ajuste del sistema",
  tags: ["config"],
  method: "post",
  path: "/config/set",
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpsertSettingSchema.openapi({}),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Ajuste configurado exitosamente",
      content: {
        "application/json": {
          schema: z.object({ setting: SettingSchema }),
        },
      },
    },
  },
});
configRoutes.post("/set", authenticateAndSetContext, setSetting);

registry.registerPath({
  description: "Obtener valor de ajuste del sistema",
  tags: ["config"],
  method: "get",
  path: "/config/get/{name}",
  security: [{ Bearer: [] }],
  request: {
    params: GetSettingParamsSchema,
  },
  responses: {
    200: {
      description: "Valor del ajuste obtenido",
      content: {
        "application/json": {
          schema: z.object({ setting: SettingSchema }),
        },
      },
    },
  },
});
configRoutes.get("/get/:name", authenticateAndSetContext, getSetting);
