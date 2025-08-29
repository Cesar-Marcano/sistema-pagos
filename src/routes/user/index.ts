import { Router } from "express";
import { register } from "./register";
import { login } from "./login";
import passport from "passport";

export const userRoutes: Router = Router();

userRoutes.post("/register", register);
userRoutes.post("/login", login);
