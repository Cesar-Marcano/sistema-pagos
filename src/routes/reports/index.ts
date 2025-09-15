import { Router } from "express";
import { getStudentTotalMonthlyFee } from "./getStudentTotalMonthlyFee";
import { getMonthRevenue } from "./getMonthRevenue";
import { getStudentDue } from "./getStudentDue";
import { getStudentsInOverdue } from "./getStudentsInOverdue";
import { getRegistry } from "../../config/openApiRegistry";
import {
  StudentTotalMonthlyFeeQueryParamsSchema,
  StudentTotalMonthlyFeeResponseSchema,
  MonthRevenueQueryParamsSchema,
  MonthRevenueResponseSchema,
  StudentDueQueryParamsSchema,
  StudentDueResponseSchema,
  StudentsInOverdueQueryParamsSchema,
  StudentsInOverdueResponseSchema,
} from "./schemas";
import { authenticateAndSetContext } from "../../middlewares/authenticateAndSetContext";

export const reportsRoutes: Router = Router();

const registry = getRegistry();

registry.registerPath({
  description: "Obtener mensualidad total de estudiante.",
  tags: ["reports"],
  method: "get",
  path: "/reports/studentTotalMonthlyFee",
  security: [{ Bearer: [] }],
  request: {
    query: StudentTotalMonthlyFeeQueryParamsSchema,
  },
  responses: {
    200: {
      description: "Mensualidad total del estudiante",
      content: {
        "application/json": {
          schema: StudentTotalMonthlyFeeResponseSchema,
        },
      },
    },
  },
});
reportsRoutes.get(
  "/studentTotalMonthlyFee",
  authenticateAndSetContext,
  getStudentTotalMonthlyFee
);

registry.registerPath({
  description: "Obtener ingresos del mes.",
  tags: ["reports"],
  method: "get",
  path: "/reports/monthRevenue",
  security: [{ Bearer: [] }],
  request: {
    query: MonthRevenueQueryParamsSchema,
  },
  responses: {
    200: {
      description: "Ingresos del mes",
      content: {
        "application/json": {
          schema: MonthRevenueResponseSchema,
        },
      },
    },
  },
});
reportsRoutes.get("/monthRevenue", authenticateAndSetContext, getMonthRevenue);

registry.registerPath({
  description: "Obtener deuda de estudiante.",
  tags: ["reports"],
  method: "get",
  path: "/reports/studentDue",
  security: [{ Bearer: [] }],
  request: {
    query: StudentDueQueryParamsSchema,
  },
  responses: {
    200: {
      description: "Deuda del estudiante",
      content: {
        "application/json": {
          schema: StudentDueResponseSchema,
        },
      },
    },
  },
});
reportsRoutes.get("/studentDue", authenticateAndSetContext, getStudentDue);

registry.registerPath({
  description: "Obtener estudiantes en mora.",
  tags: ["reports"],
  method: "get",
  path: "/reports/studentsInOverdue",
  security: [{ Bearer: [] }],
  request: {
    query: StudentsInOverdueQueryParamsSchema,
  },
  responses: {
    200: {
      description: "Estudiantes en mora",
      content: {
        "application/json": {
          schema: StudentsInOverdueResponseSchema,
        },
      },
    },
  },
});
reportsRoutes.get(
  "/studentsInOverdue",
  authenticateAndSetContext,
  getStudentsInOverdue
);
