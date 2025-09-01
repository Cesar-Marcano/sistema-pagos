import { Router } from "express";
import passport from "passport";
import { createStudent } from "./createStudent";
import { findStudentById } from "./findStudentById";
import { searchStudent } from "./searchStudent";
import { updateStudent } from "./updateStudent";
import { softDeleteStudent } from "./softDeleteStudent";
import { registerStudentToGrade } from "./registerStudentToGrade";
import { unregisterStudentFromGrade } from "./unregisterStudentToGrade";
import { hasGrade } from "./hasGrade";

export const studentRoutes: Router = Router();

studentRoutes.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  createStudent
);
studentRoutes.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  updateStudent
);
studentRoutes.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  softDeleteStudent
);
studentRoutes.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  findStudentById
);
studentRoutes.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  searchStudent
);
studentRoutes.post(
  "/registerStudentToGrade",
  passport.authenticate("jwt", { session: false }),
  registerStudentToGrade
);
studentRoutes.delete(
  "/unregisterStudentFromGrade",
  passport.authenticate("jwt", { session: false }),
  unregisterStudentFromGrade
);
studentRoutes.get(
  "/studentGrades",
  passport.authenticate("jwt", { session: false }),
  searchStudent
);
studentRoutes.get(
  "/hasGrade",
  passport.authenticate("jwt", { session: false }),
  hasGrade
);
