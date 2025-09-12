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

    const studentPeriodDiscount =
      await this.prisma.studentPeriodDiscount.create({
        data: {
          discountId,
          schoolPeriodId,
          studentId,
        },
      });

    this.auditLogService.createLog(
      AuditableEntities.STUDENT_PERIOD_DISCOUNT,
      AuditLogActions.CREATE,
      studentPeriodDiscount
    );

    return studentPeriodDiscount;
  }

  public async unapplyDiscountFromStudentPeriod(id: number) {
    const studentPeriodDiscount =
      await this.prisma.studentPeriodDiscount.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });

    this.auditLogService.createLog(
      AuditableEntities.STUDENT_PERIOD_DISCOUNT,
      AuditLogActions.SOFT_DELETE,
      { deletedAt: studentPeriodDiscount.deletedAt }
    );

    return studentPeriodDiscount;
  }

  public async listStudentPeriodDiscounts(
    studentId: number,
    schoolPeriodId: number
  ) {
    return await this.prisma.studentPeriodDiscount.findMany({
      where: {
        schoolPeriodId,
        studentId,
        deletedAt: null,
      },
      include: {
        discount: true,
      },
    });
  }

  public async applyStudentDiscountsToPeriod(
    studentId: number,
    schoolPeriodId: number
  ) {
    const studentDiscounts = await this.prisma.studentDiscount.findMany({
      where: { studentId, deletedAt: null },
    });

    if (studentDiscounts.length === 0) return [];

    const appliedDiscounts: any[] = [];

    for (const discount of studentDiscounts) {
      const existing = await this.prisma.studentPeriodDiscount.findFirst({
        where: {
          studentId,
          schoolPeriodId,
          discountId: discount.discountId,
          deletedAt: null,
        },
      });

      if (!existing) {
        const studentPeriodDiscount =
          await this.prisma.studentPeriodDiscount.create({
            data: {
              studentId,
              schoolPeriodId,
              discountId: discount.discountId,
            },
          });

        this.auditLogService.createLog(
          AuditableEntities.STUDENT_PERIOD_DISCOUNT,
          AuditLogActions.CREATE,
          studentPeriodDiscount
        );

        appliedDiscounts.push(studentPeriodDiscount);
      }
    }

    return appliedDiscounts;
  }
}
