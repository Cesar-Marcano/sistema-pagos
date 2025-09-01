import { Router } from "express";
import passport from "passport";
import { createSchoolPeriod } from "./createSchoolPeriod";
import { updateSchoolPeriod } from "./updateSchoolPeriod";
import { softDeleteSchoolPeriod } from "./softDeleteSchoolPeriod";
import { findSchoolPeriodById } from "./findSchoolPeriodById";
import { searchSchoolPeriod } from "./searchSchoolPeriod";

export const schoolPeriodRoutes: Router = Router();

schoolPeriodRoutes.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  createSchoolPeriod
);
schoolPeriodRoutes.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  updateSchoolPeriod
);
schoolPeriodRoutes.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  softDeleteSchoolPeriod
);
schoolPeriodRoutes.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  findSchoolPeriodById
);
schoolPeriodRoutes.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  searchSchoolPeriod
);
