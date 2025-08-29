import { Router } from "express";
import passport from "passport";
import { createSchoolYear } from "./createSchoolYear";
import { updateSchoolYear } from "./updateSchoolYear";

export const schoolYearRoutes: Router = Router();

schoolYearRoutes.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  createSchoolYear
);
schoolYearRoutes.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  updateSchoolYear
);
