import { Router } from "express";
import passport from "passport";
import { createSchoolYear } from "./createSchoolYear";
import { updateSchoolYear } from "./updateSchoolYear";
import { softDeleteSchoolYear } from "./softDelete";

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
schoolYearRoutes.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  softDeleteSchoolYear
);
