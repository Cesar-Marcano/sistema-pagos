import { z } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import logger from "../app/logger";

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
      return res.status(404).json({
        message: "El registro no fue encontrado para la operación.",
        target: err.meta?.target,
      });
    }
  }

  logger.error(err);
  return res.status(500).json({ message: "Error interno del servidor" });
}
