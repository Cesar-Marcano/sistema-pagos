import z from "zod";
import { getRegistry } from "../config/openApiRegistry";

const registry = getRegistry();

export const FindByIdParamsSchema = registry.register(
  "FindByIdQuery",
  z.object({
    includeDeleted: z
      .string()
      .optional()
      .transform((val) => val === "true")
      .default(false),
  })
);
