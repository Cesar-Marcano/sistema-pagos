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
    403: {
      description: "Credenciales incorrectas",
    },
    201: {
      description: "Sesión iniciada",
      content: {
        "application/json": {
          schema: z.object({
            token: z.jwt(),
          }),
        },
      },
    },
  },
});
userRoutes.post("/login", login);
