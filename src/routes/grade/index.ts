import { Router } from "express";
import passport from "passport";
import { createGrade } from "./createGrade";
import { findGradeById } from "./findGradeById";
import { searchGrade } from "./searchGrade";
import { updateGrade } from "./updateGrade";
import { softDeleteGrade } from "./softDeleteGrade";

export const gradeRoutes: Router = Router();

gradeRoutes.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  createGrade
);
gradeRoutes.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  updateGrade
);
gradeRoutes.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  softDeleteGrade
);
gradeRoutes.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  findGradeById
);
gradeRoutes.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  searchGrade
);
