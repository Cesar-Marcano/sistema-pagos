import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { Discount, PrismaClient } from "@prisma/client";
import createHttpError from "http-errors";
import {
  SearchArgs,
  SearchResult,
  searchWithPaginationAndCriteria,
} from "../lib/search";

@injectable()
export class DiscountFeature {
  constructor(@inject(TYPES.Prisma) private readonly prisma: PrismaClient) {}

  public async create(
    name: string,
    description: string,
    amount: number,
    isPercentage: boolean
  ) {
    const existentDiscountWithNameCount = await this.prisma.discount.count({
      where: {
        name,
        deletedAt: null,
      },
    });

    if (existentDiscountWithNameCount > 0)
      throw createHttpError(409, "Ya existe un descuento con el mismo nombre.");

    if (amount <= 0)
      throw createHttpError(400, "Amount no puede ser menor o igual a cero.");

    return await this.prisma.discount.create({
      data: {
        name,
        description,
        amount,
        isPercentage,
      },
    });
  }

  public async update(
    id: number,
    data: {
      name?: string;
      description?: string;
      amount?: number;
      isPercentage?: boolean;
    }
  ) {
    if (data.name) {
      const existentDiscountWithNameCount = await this.prisma.discount.count({
        where: {
          name: data.name,
          deletedAt: null,
        },
      });

      if (existentDiscountWithNameCount > 0)
        throw createHttpError(
          409,
          "Ya existe un descuento con el mismo nombre."
        );
    }

    if (data.amount && data.amount <= 0)
      throw createHttpError(400, "Amount no puede ser menor o igual a cero.");

    return await this.prisma.discount.update({
      where: {
        id,
        deletedAt: null,
      },
      data,
    });
  }

  public async softDelete(id: number) {
    return await this.prisma.discount.update({
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
    return await this.prisma.discount.delete({
      where: {
        id,
        deletedAt: {
          not: null,
        },
      },
    });
  }

  public async findById(id: number, includeDeleted: boolean) {
    return await this.prisma.discount.findUnique({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  public async search(
    args: SearchArgs<
      Partial<
        Omit<Discount, "id" | "deletedAt" | "createdAt" | "updatedAt">
      > & {
        deletedAt?: {
          not: null;
        };
      }
    >
  ): Promise<SearchResult<Discount>> {
    return searchWithPaginationAndCriteria(
      this.prisma.discount.findMany,
      this.prisma.discount.count,
      {
        ...args,
        where: { ...args.where, deletedAt: null },
      }
    );
  }
}
