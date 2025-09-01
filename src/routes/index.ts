import { Router } from "express";
import { userRoutes } from "./user";
import { schoolYearRoutes } from "./schoolYear";
import { gradeRoutes } from "./grade";
import { schoolPeriodRoutes } from "./schoolPeriod";
import { studentRoutes } from "./student";
import { monthlyFeeRoutes } from "./monthlyFee";
import { discountRoutes } from "./discount";
import { paymentRoutes } from "./payment";
import { paymentMethodRoutes } from "./paymentMethod";

export const router: Router = Router();

router.use("/user", userRoutes);
router.use("/schoolYear", schoolYearRoutes);
router.use("/grade", gradeRoutes);
router.use("/schoolPeriod", schoolPeriodRoutes);
router.use("/paymentMethod", paymentMethodRoutes);
router.use("/student", studentRoutes);
router.use("/monthlyFee", monthlyFeeRoutes);
router.use("/discount", discountRoutes);
router.use("/payment", paymentRoutes);
