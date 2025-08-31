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
          id: {
            not: id,
          },
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
        where: { ...args.where },
      }
    );
  }

  public async applyDiscountToStudent(discountId: number, studentId: number) {
    return await this.prisma.studentDiscount.create({
      data: {
        discountId,
        studentId,
      },
    });
  }

  public async unapplyDiscountFromStudent(id: number) {
    return await this.prisma.studentDiscount.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  public async listStudentDiscounts(studentId: number) {
    return await this.prisma.studentDiscount.findMany({
      where: {
        studentId,
        deletedAt: null,
      },
      include: {
        discount: true,
      },
    });
  }

  public async applyDiscountToStudentPeriod(
    discountId: number,
    schoolPeriodId: number,
    studentId: number
  ) {
    const existentDiscountAssignedToPeriodCount =
      await this.prisma.studentPeriodDiscount.count({
        where: {
          discountId,
          schoolPeriodId,
          studentId,
          deletedAt: null,
        },
      });

    if (existentDiscountAssignedToPeriodCount > 0)
      throw createHttpError(
        409,
        "Ya el descuento fue asignado al periodo del estudiante."
      );

    return await this.prisma.studentPeriodDiscount.create({
      data: {
        discountId,
        schoolPeriodId,
        studentId,
      },
    });
  }

  public async unapplyDiscountFromStudentPeriod(id: number) {
    return await this.prisma.studentPeriodDiscount.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  public async listStudentPeriodDiscounts(schoolPeriodId: number) {
    return await this.prisma.studentPeriodDiscount.findMany({
      where: {
        schoolPeriodId,
        deletedAt: null,
      },
      include: {
        discount: true,
      },
    });
  }
}
