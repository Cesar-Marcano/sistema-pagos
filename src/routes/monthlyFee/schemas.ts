import z from "zod";
import { getRegistry } from "../../config/openApiRegistry";

const registry = getRegistry();

export const GetEffectiveMonthlyFeeQueryParamsSchema = registry.register(
  "GetEffectiveMonthlyFeeQuery",
  z.object({
    gradeId: z.string().transform(Number).pipe(z.number().positive()),
    periodId: z.string().transform(Number).pipe(z.number().positive()),
  })
);
