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

  public async assignDiscountToPayment(discountId: number, paymentId: number) {
    const existentDiscountAssignedToPaymentCount =
      await this.prisma.paymentDiscount.count({
        where: {
          discountId,
          paymentId,
          deletedAt: null,
        },
      });

    if (existentDiscountAssignedToPaymentCount > 0)
      throw createHttpError(409, "Ya el descuento fue asignado al pago.");

    return await this.prisma.paymentDiscount.create({
      data: {
        discountId,
        paymentId,
      },
    });
  }

  public async unassignDiscountFromPayment(id: number) {
    return await this.prisma.paymentDiscount.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  public async findPaymentDiscount(id: number) {
    return await this.prisma.paymentDiscount.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        discount: true,
      },
    });
  }

  public async listPaymentDiscounts(paymentId: number) {
    return await this.prisma.paymentDiscount.findMany({
      where: {
        paymentId,
        deletedAt: null,
      },
      include: {
        discount: true,
      },
    });
  }
}
