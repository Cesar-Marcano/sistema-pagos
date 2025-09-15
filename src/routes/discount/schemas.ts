import z from "zod";
import { getRegistry } from "../../config/openApiRegistry";

const registry = getRegistry();

export const DiscountSchema = registry.register(
  "DiscountSchema",
  z.object({
    createdAt: z.date(),
    deletedAt: z.date().nullable(),
    id: z.number().positive(),
    updatedAt: z.date(),
    name: z.string().trim().min(3),
    description: z.string().trim().min(3),
    amount: z.number().positive(),
    isPercentage: z.boolean().default(true),
  })
);

export const StudentDiscountSchema = registry.register(
  "StudentDiscountSchema",
  z.object({
    createdAt: z.date(),
    deletedAt: z.date().nullable(),
    id: z.number().positive(),
    updatedAt: z.date(),
    discountId: z.number().positive(),
    studentId: z.number().positive(),
  })
);

export const StudentMonthDiscountSchema = registry.register(
  "StudentMonthDiscountSchema",
  z.object({
    createdAt: z.date(),
    deletedAt: z.date().nullable(),
    id: z.number().positive(),
    updatedAt: z.date(),
    schoolMonthId: z.number().positive(),
    discountId: z.number().positive(),
    studentId: z.number().positive(),
  })
);

export const CreateDiscountSchema = registry.register(
  "CreateDiscountSchema",
  DiscountSchema.pick({
    name: true,
    description: true,
    amount: true,
    isPercentage: true,
  })
);

export const ApplyDiscountToStudentSchema = registry.register(
  "ApplyDiscountToStudentSchema",
  StudentDiscountSchema.pick({
    studentId: true,
    discountId: true,
  })
);

export const ApplyDiscountToStudentMonthSchema = registry.register(
  "ApplyDiscountToStudentMonthSchema",
  StudentMonthDiscountSchema.pick({
    studentId: true,
    discountId: true,
    schoolMonthId: true,
  })
);

export const DiscountSearchCriteriaQueryParams = registry.register(
  "DiscountSearchCriteriaQuery",
  z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    amount: z.string().optional().transform(Number),
    isPercentage: z
      .string()
      .optional()
      .transform((val) => {
        if (val === undefined) return undefined;
        if (val === "true") return true;
        if (val === "false") return false;
        return undefined;
      }),
  })
);

export const UpdateDiscountSchema = registry.register(
  "UpdateDiscountSchema",
  CreateDiscountSchema.partial()
);
