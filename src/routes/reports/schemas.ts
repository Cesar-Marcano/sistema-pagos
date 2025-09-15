import z from "zod";
import { getRegistry } from "../../config/openApiRegistry";

const registry = getRegistry();

export const StudentTotalMonthlyFeeQueryParamsSchema = registry.register(
  "StudentTotalMonthlyFeeQueryParams",
  z.object({
    gradeId: z.string().transform(Number).pipe(z.number().positive()),
    studentId: z.string().transform(Number).pipe(z.number().positive()),
    schoolMonthId: z.string().transform(Number).pipe(z.number().positive()),
  })
);

export const MonthRevenueQueryParamsSchema = registry.register(
  "MonthRevenueQueryParams",
  z.object({
    schoolMonthId: z.string().transform(Number).pipe(z.number().positive()),
  })
);

export const StudentDueQueryParamsSchema = registry.register(
  "StudentDueQueryParams",
  z.object({
    schoolMonthId: z.string().transform(Number).pipe(z.number().positive()),
    studentId: z.string().transform(Number).pipe(z.number().positive()),
  })
);

export const StudentsInOverdueQueryParamsSchema = registry.register(
  "StudentsInOverdueQueryParams",
  z.object({
    schoolMonthId: z.string().transform(Number).pipe(z.number().positive()),
  })
);

export const StudentTotalMonthlyFeeResponseSchema = registry.register(
  "StudentTotalMonthlyFeeResponse",
  z.object({
    totalMonthlyFee: z.string(),
  })
);

export const MonthRevenueResponseSchema = registry.register(
  "MonthRevenueResponse",
  z.object({
    expectedRevenue: z.string(),
    totalRevenue: z.string(),
  })
);

export const StudentDueResponseSchema = registry.register(
  "StudentDueResponse",
  z.object({
    totalPaid: z.string(),
    totalMonthlyFee: z.string(),
    due: z.string(),
  })
);

export const OverdueStudentSchema = registry.register(
  "OverdueStudent",
  z.object({
    studentId: z.number(),
    studentName: z.string(),
    grade: z.string(),
    totalFee: z.string(),
    paid: z.string(),
    due: z.string(),
    status: z.enum(["DUE", "OVERDUE"]),
  })
);

export const StudentsInOverdueResponseSchema = registry.register(
  "StudentsInOverdueResponse",
  z.object({
    overdueStudents: z.array(OverdueStudentSchema),
  })
);
