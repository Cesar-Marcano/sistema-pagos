import { Router } from "express";
import passport from "passport";
import { createMonthlyFee } from "./createMonthlyFee";
import { findMonthlyFeeById } from "./findMonthlyFeeById";
import { searchMonthlyFee } from "./searchMonthlyFee";
import { updateMonthlyFee } from "./updateMonthlyFee";
import { softDeleteMonthlyFee } from "./softDeleteMonthlyFee";

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
  "/:id",
  passport.authenticate("jwt", { session: false }),
  softDeleteMonthlyFee
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
