import { Router } from "express";
import { userRoutes } from "./user";

export const router: Router = Router();

router.use("/user", userRoutes);
