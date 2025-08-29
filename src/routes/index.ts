import { Router } from "express";
import { userRoutes } from "./user";
import { schoolYearRoutes } from "./schoolyear";

export const router: Router = Router();

router.use("/user", userRoutes);
router.use("/schoolYear", schoolYearRoutes);
