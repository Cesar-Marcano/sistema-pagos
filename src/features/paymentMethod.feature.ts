import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { PaymentMethod } from "@prisma/client";
import createHttpError from "http-errors";
import {
  SearchArgs,
  SearchResult,
  searchWithPaginationAndCriteria,
} from "../lib/search";
import { ExtendedPrisma } from "../config/container";

@injectable()
export class PaymentMethodFeature {
  constructor(@inject(TYPES.Prisma) private readonly prisma: ExtendedPrisma) {}

  public async create(
    name: string,
    requiresManualVerification: boolean,
    requiresReferenceId: boolean
  ): Promise<PaymentMethod> {
    const existentPaymentMethodsWithNameCount =
      await this.prisma.paymentMethod.count({
        where: {
          name,
          deletedAt: null,
        },
      });

    if (existentPaymentMethodsWithNameCount > 0)
      throw createHttpError(
        409,
        "Ya existe un metodo de pago con el nombre ingresado."
      );

    return await this.prisma.paymentMethod.create({
      data: {
        name,
        requiresManualVerification,
        requiresReferenceId,
      },
    });
  }

  public async update(id: number, name: string): Promise<PaymentMethod> {
    const existentPaymentMethodsWithNameCount =
      await this.prisma.paymentMethod.count({
        where: {
          name,
          id: {
            not: id,
          },
          deletedAt: null,
        },
      });

    if (existentPaymentMethodsWithNameCount > 0)
      throw createHttpError(
        409,
        "Ya existe un metodo de pago con el nombre ingresado."
      );

    return await this.prisma.paymentMethod.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        name,
      },
    });
  }

  public async softDelete(id: number): Promise<PaymentMethod> {
    return await this.prisma.paymentMethod.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: null,
      },
    });
  }

  public async hardDelete(id: number): Promise<PaymentMethod> {
    return await this.prisma.paymentMethod.delete({
      where: {
        id,
        deletedAt: {
          not: null,
        },
      },
    });
  }

  public async findById(
    id: number,
    includeDeleted: boolean
  ): Promise<PaymentMethod | null> {
    return await this.prisma.paymentMethod.findUnique({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  public async search(
    args: SearchArgs<
      Partial<
        Omit<PaymentMethod, "id" | "deletedAt" | "createdAt" | "updatedAt">
      > & {
        deletedAt?: {
          not: null;
        };
      }
    >
  ): Promise<SearchResult<PaymentMethod>> {
    return searchWithPaginationAndCriteria<PaymentMethod>(
      this.prisma.paymentMethod.findMany,
      this.prisma.paymentMethod.similarity,
      {
        ...args,
        where: { ...args.where },
      }
    );
  }
}
