import { Router } from "express";
import { register } from "./register";
import { login } from "./login";
import { getRegistry } from "../../config/openApiRegistry";
import { LoginSchema, RegisterSchema } from "./schemas";
import z from "zod";

export const userRoutes: Router = Router();

const registry = getRegistry();

registry.registerPath({
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
      description: "Registrar usuario",
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
userRoutes.post("/register", register);

registry.registerPath({
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
    201: {
      description: "Iniciar sesión",
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
