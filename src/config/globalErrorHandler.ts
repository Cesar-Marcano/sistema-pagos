import { z } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import logger from "../app/logger";

const modelToSpanishName: Record<string, string> = {
  User: "Usuario",
  SchoolYear: "Año Escolar",
  SchoolPeriod: "Periodo Escolar",
  SchoolMonth: "Mes Escolar",
  Student: "Estudiante",
  MonthlyFee: "Mensualidad",
  MonthlyFeeOnGrade: "Mensualidad por Grado",
  Grade: "Grado",
  StudentGrade: "Grado del Estudiante",
  Discount: "Descuento",
  StudentDiscount: "Descuento del Estudiante",
  PaymentMethod: "Método de Pago",
  Payment: "Pago",
  StudentMonthDiscount: "Descuento del Mes del Estudiante",
  AuditLog: "Registro de Auditoría",
  Session: "Sesión",
  Setting: "Configuración",
};

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof z.ZodError) {
    const issues = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    return res.status(400).json({
      message: "Error de validación",
      details: issues,
    });
  }

  if (createHttpError.isHttpError(err)) {
    return res.status(err.status).json({
      message: err.message,
    });
  }

  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        message: "El registro ya existe.",
        target: err.meta?.target,
      });
    }

    if (err.code === "P2025") {
      const modelName = err.meta?.modelName as string;
      let message = "El registro no fue encontrado para la operación.";
      if (modelName) {
        const spanishName = modelToSpanishName[modelName] || modelName;
        message = `No se encontró ${spanishName} con los parámetros proporcionados.`;
      }
      return res.status(404).json({
        message,
        target: err.meta?.target,
      });
    }

    if (err.code === "P2003") {
      const modelName = err.meta?.modelName as string;

      const spanishName = modelToSpanishName[modelName] || modelName;

      let message = "Violación de una clave foránea.";

      if (modelName) {
        message = `No se puede realizar la operación. El valor para '${spanishName}' no existe en la tabla relacionada.`;
      }

      return res.status(400).json({
        message,
        target: spanishName,
      });
    }
  }

  logger.error(err);
  return res.status(500).json({ message: "Error interno del servidor" });
}
