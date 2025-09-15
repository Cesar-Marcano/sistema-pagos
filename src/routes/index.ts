import { Router } from "express";
import { userRoutes } from "./user";
import { schoolYearRoutes } from "./schoolYear";
import { gradeRoutes } from "./grade";
import { schoolMonthRoutes } from "./schoolMonth";
import { studentRoutes } from "./student";
import { monthlyFeeRoutes } from "./monthlyFee";
import { discountRoutes } from "./discount";
import { paymentRoutes } from "./payment";
import { paymentMethodRoutes } from "./paymentMethod";
import { schoolPeriodRoutes } from "./schoolPeriod";

export const router: Router = Router();

router.use("/user", userRoutes);
router.use("/schoolYear", schoolYearRoutes);
router.use("/grade", gradeRoutes);
router.use("/schoolMonth", schoolMonthRoutes);
router.use("/paymentMethod", paymentMethodRoutes);
router.use("/student", studentRoutes);
router.use("/monthlyFee", monthlyFeeRoutes);
router.use("/discount", discountRoutes);
router.use("/payment", paymentRoutes);
router.use("/schoolPeriod", schoolPeriodRoutes);
