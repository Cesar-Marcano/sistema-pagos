import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import z from "zod";
import createHttpError from "http-errors";
import { MonthlyFeeFeature } from "../../features/monthlyFee.feature";

const paramsSchema = z.object({
  includeDeleted: z
    .string()
    .optional()
    .transform((val) => val === "true")
    .default(false),
});

export async function findMonthlyFeeById(req: Request, res: Response) {
  const monthlyFeeFeature = container.get<MonthlyFeeFeature>(
    TYPES.MonthlyFeeFeature
  );

  const queryParams = paramsSchema.parse(req.query);

  const monthlyFee = await monthlyFeeFeature.findById(
    Number(req.params.id),
    queryParams.includeDeleted
  );

  if (!monthlyFee) throw createHttpError(404, "Mensualidad no encontrada.");

  res.json({ monthlyFee });
}
