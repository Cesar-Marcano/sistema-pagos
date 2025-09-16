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
import z from "zod";

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
    400: {
      description: "Parámetros de consulta inválidos",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    401: {
      description: "No autenticado",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    404: {
      description: "Estudiante, grado o mes escolar no encontrado",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    500: {
      description: "Error interno del servidor",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
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
    400: {
      description: "Parámetros de consulta inválidos",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    401: {
      description: "No autenticado",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    404: {
      description: "Mes escolar no encontrado",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    500: {
      description: "Error interno del servidor",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
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
    400: {
      description: "Parámetros de consulta inválidos",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    401: {
      description: "No autenticado",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    404: {
      description: "Estudiante o mes escolar no encontrado",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    500: {
      description: "Error interno del servidor",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
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
    400: {
      description: "Parámetros de consulta inválidos",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    401: {
      description: "No autenticado",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    404: {
      description: "Mes escolar no encontrado",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
    500: {
      description: "Error interno del servidor",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
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
