import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { MonthlyFee, PrismaClient } from "@prisma/client";
import createHttpError from "http-errors";
import {
  SearchArgs,
  SearchResult,
  searchWithPaginationAndCriteria,
} from "../lib/search";

@injectable()
export class MonthlyFeeFeature {
  constructor(@inject(TYPES.Prisma) private readonly prisma: PrismaClient) {}

  public async create(
    description: string,
    amount: number,
    effectiveFromPeriodId: number
  ) {
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
        effectiveFrom: {
          connect: {
            id: effectiveFromPeriodId,
          },
        },
      },
    });
  }

  public async update(id: number, description: string) {
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
        updatedAt: new Date(),
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
}
