import { z } from "zod";
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import logger from "../app/logger";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log del error para debugging interno (no exponer al cliente)
  logger.error('Error interno:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  // Errores de validación de Zod
  if (err instanceof z.ZodError) {
    const issues = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    return res.status(400).json({
      message: 'Los datos proporcionados no son válidos',
      details: issues,
    });
  }

  // Errores HTTP personalizados
  if (createHttpError.isHttpError(err)) {
    return res.status(err.status).json({
      message: err.message,
    });
  }

  // Errores de Prisma - Manejo seguro sin exponer información sensible
  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          message: 'Ya existe un registro con estos datos.',
        });

      case 'P2025':
        return res.status(404).json({
          message: 'El registro solicitado no fue encontrado.',
        });

      case 'P2003':
        return res.status(400).json({
          message: 'No se puede completar la operación debido a dependencias existentes.',
        });

      case 'P2014':
        return res.status(400).json({
          message: 'No se puede eliminar el registro porque tiene datos relacionados.',
        });

      case 'P2011':
        return res.status(400).json({
          message: 'Faltan datos requeridos para completar la operación.',
        });

      default:
        // Para cualquier otro error de Prisma, devolver mensaje genérico
        return res.status(500).json({
          message: 'Error interno del servidor',
        });
    }
  }

  // Errores de validación de Prisma
  if (err instanceof PrismaClientValidationError) {
    return res.status(400).json({
      message: 'Los datos proporcionados no son válidos',
    });
  }

  // Error genérico para cualquier otro tipo de error
  return res.status(500).json({
    message: 'Error interno del servidor',
  });
}
