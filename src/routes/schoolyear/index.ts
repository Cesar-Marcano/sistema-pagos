import { Router } from "express";
import passport from "passport";
import { createSchoolYear } from "./createSchoolYear";

export const schoolYearRoutes: Router = Router();

schoolYearRoutes.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  createSchoolYear
);
