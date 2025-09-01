import z from "zod";
import { getRegistry } from "../../config/openApiRegistry";

const registry = getRegistry();

export const GradeSchema = registry.register(
  "GradeSchema",
  z.object({
    createdAt: z.date(),
    deletedAt: z.date().nullable(),
    id: z.number().positive(),
    name: z.string().trim().toUpperCase().min(3),
    updatedAt: z.date(),
  })
);
