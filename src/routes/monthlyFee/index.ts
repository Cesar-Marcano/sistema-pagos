import { Router } from "express";
import passport from "passport";
import { createMonthlyFee } from "./createMonthlyFee";
import { findMonthlyFeeById } from "./findMonthlyFeeById";
import { searchMonthlyFee } from "./searchMonthlyFee";
import { updateMonthlyFee } from "./updateMonthlyFee";
import { softDeleteMonthlyFee } from "./softDeleteMonthlyFee";
import { assignFeeToGrades } from "./assignFeeToGrades";
import { unassignFeeFromGrades } from "./unassignFeeFromGrades";
import { findMonthlyFeeOnGradeById } from "./findMonthlyFeeOnGradeById";
import { searchMonthlyFeeOnGrade } from "./searchMonthlyFeeOnGrade";

export const monthlyFeeRoutes: Router = Router();

monthlyFeeRoutes.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  createMonthlyFee
);
monthlyFeeRoutes.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  updateMonthlyFee
);
monthlyFeeRoutes.delete(
  "/unassignFeeFromGrades",
  passport.authenticate("jwt", { session: false }),
  unassignFeeFromGrades
);
monthlyFeeRoutes.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  softDeleteMonthlyFee
);
monthlyFeeRoutes.get(
  "/feeOnGrade/search",
  passport.authenticate("jwt", { session: false }),
  searchMonthlyFeeOnGrade
);
monthlyFeeRoutes.get(
  "/feeOnGrade/:id",
  passport.authenticate("jwt", { session: false }),
  findMonthlyFeeOnGradeById
);
monthlyFeeRoutes.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  findMonthlyFeeById
);
monthlyFeeRoutes.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  searchMonthlyFee
);
monthlyFeeRoutes.post(
  "/assignFeeToGrades",
  passport.authenticate("jwt", { session: false }),
  assignFeeToGrades
);
