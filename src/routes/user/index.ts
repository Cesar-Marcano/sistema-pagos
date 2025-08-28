import { Router } from "express";
import { register } from "./register";

export const userRoutes: Router = Router();

userRoutes.post("/register", register);
