import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import {
  MonthlyFee,
  MonthlyFeeOnGrade,
  Prisma,
  PrismaClient,
} from "@prisma/client";
import createHttpError from "http-errors";
import {
  SearchArgs,
  SearchResult,
  searchWithPaginationAndCriteria,
} from "../lib/search";

@injectable()
export class MonthlyFeeFeature {
  constructor(@inject(TYPES.Prisma) private readonly prisma: PrismaClient) {}

  public async create(description: string, amount: number) {
    const existentMonthlyFeeWithDescriptionCount =
      await this.prisma.monthlyFee.count({
        where: {
          description,
          deletedAt: null,
        },
      });

    if (existentMonthlyFeeWithDescriptionCount > 0)
      throw createHttpError(
        409,
        "Ya hay una mensualidad con la misma descripción."
      );

    return await this.prisma.monthlyFee.create({
      data: {
        description,
        amount,
      },
    });
  }

  public async update(id: number, description: string) {
    const existentMonthlyFeeWithDescriptionCount =
      await this.prisma.monthlyFee.count({
        where: {
          description,
          deletedAt: null,
          NOT: { id },
        },
      });

    if (existentMonthlyFeeWithDescriptionCount > 0)
      throw createHttpError(
        409,
        "Ya hay una mensualidad con la misma descripción."
      );

    return await this.prisma.monthlyFee.update({
      where: { id, deletedAt: null },
      data: {
        description,
      },
    });
  }

  public async softDelete(id: number) {
    return await this.prisma.monthlyFee.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  public async hardDelete(id: number) {
    return await this.prisma.monthlyFee.delete({
      where: {
        id,
        deletedAt: {
          not: null,
        },
      },
    });
  }

  public async findById(id: number, includeDeleted: boolean) {
    return await this.prisma.monthlyFee.findUnique({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  public async search(
    args: SearchArgs<
      Partial<
        Omit<MonthlyFee, "id" | "deletedAt" | "createdAt" | "updatedAt">
      > & {
        deletedAt?: {
          not: null;
        };
      }
    >
  ): Promise<SearchResult<MonthlyFee>> {
    return searchWithPaginationAndCriteria(
      this.prisma.monthlyFee.findMany,
      this.prisma.monthlyFee.count,
      {
        ...args,
        where: { ...args.where, deletedAt: null },
      }
    );
  }

  public async assignFeeToGrades(
    gradeIds: number[],
    monthlyFeeId: number,
    effectiveFromPeriodId: number
  ) {
    if (gradeIds.length < 1) {
      throw createHttpError(400, "No se proporcionaron grados.");
    }

    const assignmentsToCreate = gradeIds.map((gradeId) => ({
      monthlyFeeId,
      gradeId,
      schoolPeriodId: effectiveFromPeriodId,
    }));

    const uniqueAssignments = this.getUniqueAssignments(assignmentsToCreate);

    return await this.prisma.monthlyFeeOnGrade.createMany({
      data: uniqueAssignments,
      skipDuplicates: true,
    });
  }

  public async unassignFeeFromGrades(ids: number[]) {
    return await this.prisma.monthlyFeeOnGrade.updateMany({
      where: {
        id: {
          in: ids,
        },
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  private getUniqueAssignments(
    assignments: {
      monthlyFeeId: number;
      gradeId: number;
      schoolPeriodId: number;
    }[]
  ) {
    const seen = new Set<string>();
    return assignments.filter((item) => {
      const key = `${item.monthlyFeeId}-${item.gradeId}-${item.schoolPeriodId}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  public async findMonthlyFeeOnGradeById(id: number, includeDeleted: boolean) {
    return await this.prisma.monthlyFeeOnGrade.findUnique({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: {
        monthlyFee: true,
        grade: true,
        effectiveFromPeriod: true,
      },
    });
  }

  public async searchMonthlyFeeOnGrade(
    args: SearchArgs<
      Partial<
        Omit<MonthlyFeeOnGrade, "id" | "deletedAt" | "createdAt" | "updatedAt">
      > & {
        deletedAt?: {
          not: null;
        };
      }
    >
  ): Promise<SearchResult<MonthlyFeeOnGrade>> {
    return searchWithPaginationAndCriteria(
      this.prisma.monthlyFeeOnGrade.findMany,
      this.prisma.monthlyFeeOnGrade.count,
      {
        ...args,
        where: { ...args.where, deletedAt: null },
      }
    );
  }
}
