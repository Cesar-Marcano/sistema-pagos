import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { AuditableEntities, AuditLogActions, Discount } from "@prisma/client";
import createHttpError from "http-errors";
import {
  SearchArgs,
  SearchResult,
  searchWithPaginationAndCriteria,
} from "../lib/search";
import { ExtendedPrisma } from "../config/container";
import { AuditLogService } from "../services/auditLog.service";

@injectable()
export class DiscountFeature {
  constructor(
    @inject(TYPES.Prisma) private readonly prisma: ExtendedPrisma,
    @inject(TYPES.AuditLogService)
    private readonly auditLogService: AuditLogService
  ) {}

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

    const newDiscount = await this.prisma.discount.create({
      data: {
        name,
        description,
        amount,
        isPercentage,
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.DISCOUNT,
      AuditLogActions.CREATE,
      newDiscount
    );

    return newDiscount;
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

    const updatedDiscount = await this.prisma.discount.update({
      where: {
        id,
        deletedAt: null,
      },
      data,
    });

    this.auditLogService.createLog(
      AuditableEntities.DISCOUNT,
      AuditLogActions.UPDATE,
      data
    );

    return updatedDiscount;
  }

  public async softDelete(id: number) {
    const discount = await this.prisma.discount.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.DISCOUNT,
      AuditLogActions.SOFT_DELETE,
      { deletedAt: discount.deletedAt }
    );

    return discount;
  }

  public async hardDelete(id: number) {
    const discount = await this.prisma.discount.delete({
      where: {
        id,
        deletedAt: {
          not: null,
        },
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.DISCOUNT,
      AuditLogActions.DELETE,
      {}
    );

    return discount;
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
    return searchWithPaginationAndCriteria<Discount>(
      this.prisma.discount.findMany,
      this.prisma.discount.similarity,
      {
        ...args,
        where: { ...args.where },
      }
    );
  }

  public async applyDiscountToStudent(discountId: number, studentId: number) {
    const studentDiscount = await this.prisma.studentDiscount.create({
      data: {
        discountId,
        studentId,
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.STUDENT_DISCOUNT,
      AuditLogActions.CREATE,
      studentDiscount
    );

    return studentDiscount;
  }

  public async unapplyDiscountFromStudent(id: number) {
    const studentDiscount = await this.prisma.studentDiscount.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.STUDENT_DISCOUNT,
      AuditLogActions.SOFT_DELETE,
      { deletedAt: studentDiscount.deletedAt }
    );

    return studentDiscount;
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

  public async applyDiscountToStudentMonth(
    discountId: number,
    schoolMonthId: number,
    studentId: number
  ) {
    const existentDiscountAssignedToMonthCount =
      await this.prisma.studentMonthDiscount.count({
        where: {
          discountId,
          schoolMonthId,
          studentId,
          deletedAt: null,
        },
      });

    if (existentDiscountAssignedToMonthCount > 0)
      throw createHttpError(
        409,
        "Ya el descuento fue asignado al mes del estudiante."
      );

    const studentMonthDiscount =
      await this.prisma.studentMonthDiscount.create({
        data: {
          discountId,
          schoolMonthId,
          studentId,
        },
      });

    this.auditLogService.createLog(
      AuditableEntities.STUDENT_MONTH_DISCOUNT,
      AuditLogActions.CREATE,
      studentMonthDiscount
    );

    return studentMonthDiscount;
  }

  public async unapplyDiscountFromStudentMonth(id: number) {
    const studentMonthDiscount =
      await this.prisma.studentMonthDiscount.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });

    this.auditLogService.createLog(
      AuditableEntities.STUDENT_MONTH_DISCOUNT,
      AuditLogActions.SOFT_DELETE,
      { deletedAt: studentMonthDiscount.deletedAt }
    );

    return studentMonthDiscount;
  }

  public async listStudentMonthDiscounts(
    studentId: number,
    schoolMonthId: number
  ) {
    return await this.prisma.studentMonthDiscount.findMany({
      where: {
        schoolMonthId,
        studentId,
        deletedAt: null,
      },
      include: {
        discount: true,
      },
    });
  }

  public async applyStudentDiscountsToMonth(
    studentId: number,
    schoolMonthId: number
  ) {
    const studentDiscounts = await this.prisma.studentDiscount.findMany({
      where: { studentId, deletedAt: null },
    });

    if (studentDiscounts.length === 0) return [];

    const appliedDiscounts: any[] = [];

    for (const discount of studentDiscounts) {
      const existing = await this.prisma.studentMonthDiscount.findFirst({
        where: {
          studentId,
          schoolMonthId,
          discountId: discount.discountId,
          deletedAt: null,
        },
      });

      if (!existing) {
        const studentMonthDiscount =
          await this.prisma.studentMonthDiscount.create({
            data: {
              studentId,
              schoolMonthId,
              discountId: discount.discountId,
            },
          });

        this.auditLogService.createLog(
          AuditableEntities.STUDENT_MONTH_DISCOUNT,
          AuditLogActions.CREATE,
          studentMonthDiscount
        );

        appliedDiscounts.push(studentMonthDiscount);
      }
    }

    return appliedDiscounts;
  }
}
