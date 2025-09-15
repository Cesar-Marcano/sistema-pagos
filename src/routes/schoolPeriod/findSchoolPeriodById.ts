import { Request, Response } from "express";
import { container } from "../../config/container";
import { TYPES } from "../../config/types";
import { SchoolPeriodFeature } from "../../features/schoolPeriod.feature";
import createHttpError from "http-errors";

export const findSchoolPeriodById = async (req: Request, res: Response) => {
  const schoolPeriodFeature = container.get<SchoolPeriodFeature>(
    TYPES.SchoolPeriodFeature
  );

  const { includeDeleted } = req.query;

  const schoolPeriod = await schoolPeriodFeature.findById(
    Number(req.params.id),
    includeDeleted === "true"
  );

  if (!schoolPeriod) {
    throw createHttpError(404, "Período escolar no encontrado.");
  }

  res.json({ schoolPeriod });
};
