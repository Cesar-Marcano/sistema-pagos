import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import {
  AuditableEntities,
  AuditLogActions,
  PaymentMethod,
} from "@prisma/client";
import createHttpError from "http-errors";
import {
  SearchArgs,
  SearchResult,
  searchWithPaginationAndCriteria,
} from "../lib/search";
import { ExtendedPrisma } from "../config/container";
import { AuditLogService } from "../services/auditLog.service";

@injectable()
export class PaymentMethodFeature {
  constructor(
    @inject(TYPES.Prisma) private readonly prisma: ExtendedPrisma,
    @inject(TYPES.AuditLogService)
    private readonly auditLogService: AuditLogService
  ) {}

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

    const paymentMethod = await this.prisma.paymentMethod.create({
      data: {
        name,
        requiresManualVerification,
        requiresReferenceId,
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.PAYMENT_METHOD,
      AuditLogActions.CREATE,
      paymentMethod
    );

    return paymentMethod;
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

    const paymentMethod = await this.prisma.paymentMethod.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        name,
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.PAYMENT_METHOD,
      AuditLogActions.UPDATE,
      { name }
    );

    return paymentMethod;
  }

  public async softDelete(id: number): Promise<PaymentMethod> {
    const paymentMethod = await this.prisma.paymentMethod.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: null,
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.PAYMENT_METHOD,
      AuditLogActions.SOFT_DELETE,
      { deletedAt: paymentMethod.deletedAt }
    );

    return paymentMethod;
  }

  public async hardDelete(id: number): Promise<PaymentMethod> {
    const paymentMethod = await this.prisma.paymentMethod.delete({
      where: {
        id,
        deletedAt: {
          not: null,
        },
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.PAYMENT_METHOD,
      AuditLogActions.DELETE,
      {}
    );

    return paymentMethod;
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
