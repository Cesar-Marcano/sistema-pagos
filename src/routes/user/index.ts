import { Router } from "express";
import { register } from "./register";
import { login } from "./login";
import { getRegistry } from "../../config/openApiRegistry";
import { LoginSchema, RegisterSchema } from "./schemas";
import z from "zod";
import { canRegister } from "../../middlewares/canRegister";
import passport from "passport";
import { adminUserRegister } from "./adminUserRegister";
import { authenticateAndSetContext } from "../../middlewares/authenticateAndSetContext";

export const userRoutes: Router = Router();

const registry = getRegistry();

registry.registerPath({
  description: "Registrar usuario",
  tags: ["auth"],
  method: "post",
  path: "/user/register",
  request: {
    body: {
      content: {
        "application/json": {
          schema: RegisterSchema.openapi({
            description: "Object with user register data",
            default: {
              username: "my.username",
              password: "myStrong_P4ssw0rd!",
            },
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Usuario registrado",
      content: {
        "application/json": {
          schema: z.object({
            token: z.jwt(),
          }),
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
      description: "No autorizado para registrar usuarios",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    409: {
      description: "Usuario ya existe",
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
userRoutes.post("/register", canRegister, register);

registry.registerPath({
  description: "Registrar un usuario por personal autorizado",
  tags: ["auth"],
  method: "post",
  path: "/user/adminPanel/register",
  request: {
    body: {
      content: {
        "application/json": {
          schema: RegisterSchema.openapi({
            description: "Object with user register data",
            default: {
              username: "my.username",
              password: "myStrong_P4ssw0rd!",
            },
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Usuario registrado",
      content: {
        "application/json": {
          schema: z.object({
            token: z.jwt(),
          }),
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
    403: {
      description: "No autorizado",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    409: {
      description: "Usuario ya existe",
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
userRoutes.post(
  "/adminPanel/register",
  authenticateAndSetContext,
  adminUserRegister
);

registry.registerPath({
  description: "Iniciar sesión",
  tags: ["auth"],
  method: "post",
  path: "/user/login",
  request: {
    body: {
      content: {
        "application/json": {
          schema: LoginSchema.openapi({
            description: "Object with user login data",
            default: {
              username: "my.username",
              password: "myStrong_P4ssw0rd!",
            },
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Sesión iniciada",
      content: {
        "application/json": {
          schema: z.object({
            token: z.jwt(),
          }),
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
      description: "Credenciales incorrectas",
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
userRoutes.post("/login", login);
