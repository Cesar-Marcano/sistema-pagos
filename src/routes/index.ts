import { Router } from "express";
import { userRoutes } from "./user";
import { schoolYearRoutes } from "./schoolyear";
import { gradeRoutes } from "./grade";

export const router: Router = Router();

router.use("/user", userRoutes);
router.use("/schoolYear", schoolYearRoutes);
router.use("/grade", gradeRoutes);
