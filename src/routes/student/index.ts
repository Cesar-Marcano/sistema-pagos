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

/**
 * @openapi
 * /student:
 *   post:
 *     summary: Crear un nuevo estudiante
 *     tags:
 *       - Student
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Juan Pérez"
 *     responses:
 *       200:
 *         description: Estudiante creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 student:
 *                   $ref: '#/components/schemas/Student'
 */
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
