import { Router } from "express";
import { register } from "./register";

const userRoutes = Router();

userRoutes.post("/register", register);
