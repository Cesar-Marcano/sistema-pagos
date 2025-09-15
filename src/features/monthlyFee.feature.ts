import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import {
  AuditableEntities,
  AuditLogActions,
  MonthlyFee,
  MonthlyFeeOnGrade,
  Prisma,
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
export class MonthlyFeeFeature {
  constructor(
    @inject(TYPES.Prisma) private readonly prisma: ExtendedPrisma,
    @inject(TYPES.AuditLogService)
    private readonly auditLogService: AuditLogService
  ) {}

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

    const newMonthlyFee = await this.prisma.monthlyFee.create({
      data: {
        description,
        amount,
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.MONTHLY_FEE,
      AuditLogActions.CREATE,
      newMonthlyFee
    );

    return newMonthlyFee;
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

    const monthlyFee = await this.prisma.monthlyFee.update({
      where: { id, deletedAt: null },
      data: {
        description,
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.MONTHLY_FEE,
      AuditLogActions.UPDATE,
      { description }
    );

    return monthlyFee;
  }

  public async softDelete(id: number) {
    const monthlyFee = await this.prisma.monthlyFee.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.MONTHLY_FEE,
      AuditLogActions.SOFT_DELETE,
      { deletedAt: monthlyFee.deletedAt }
    );

    return monthlyFee;
  }

  public async hardDelete(id: number) {
    const monthlyFee = await this.prisma.monthlyFee.delete({
      where: {
        id,
        deletedAt: {
          not: null,
        },
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.MONTHLY_FEE,
      AuditLogActions.DELETE,
      {}
    );

    return monthlyFee;
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
    return searchWithPaginationAndCriteria<MonthlyFee>(
      this.prisma.monthlyFee.findMany,
      this.prisma.monthlyFee.similarity,
      {
        ...args,
        where: { ...args.where },
      }
    );
  }

  public async assignFeeToGrades(
    gradeIds: number[],
    monthlyFeeId: number,
    effectiveFromMonthId: number
  ) {
    if (gradeIds.length < 1) {
      throw createHttpError(400, "No se proporcionaron grados.");
    }

    const assignmentsToCreate = gradeIds.map((gradeId) => ({
      monthlyFeeId,
      gradeId,
      schoolMonthId: effectiveFromMonthId,
    }));

    const uniqueAssignments = this.getUniqueAssignments(assignmentsToCreate);

    const gradeIdsInAssignments = uniqueAssignments.map(assignment => assignment.gradeId);
    const uniqueGradeIds = [...new Set(gradeIdsInAssignments)];

    const existingGrades = await this.prisma.grade.findMany({
      where: {
        id: { in: uniqueGradeIds }
      },
      select: { id: true }
    });

    if (existingGrades.length !== uniqueGradeIds.length) {
      const existingGradeIds = existingGrades.map(g => g.id);
      const missingGradeIds = uniqueGradeIds.filter(id => !existingGradeIds.includes(id));
      throw createHttpError(400, `The following gradeIds do not exist: ${missingGradeIds.join(', ')}`);
    }

    const monthlyFeeOnGrades = await this.prisma.monthlyFeeOnGrade.createMany({
      data: uniqueAssignments,
      skipDuplicates: true,
    });

    this.auditLogService.createLog(
      AuditableEntities.MONTHLY_FEE_ON_GRADE,
      AuditLogActions.CREATE,
      uniqueAssignments
    );

    return monthlyFeeOnGrades;
  }

  public async unassignFeeFromGrades(ids: number[]) {
    const deletedAt = new Date();
    const monthlyFeeOnGrades = await this.prisma.monthlyFeeOnGrade.updateMany({
      where: {
        id: {
          in: ids,
        },
        deletedAt: null,
      },
      data: {
        deletedAt,
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.MONTHLY_FEE_ON_GRADE,
      AuditLogActions.CREATE,
      ids.map((id) => ({ id, deletedAt }))
    );

    return monthlyFeeOnGrades;
  }

  private getUniqueAssignments(
    assignments: {
      monthlyFeeId: number;
      gradeId: number;
      schoolMonthId: number;
    }[]
  ) {
    const seen = new Set<string>();
    return assignments.filter((item) => {
      const key = `${item.monthlyFeeId}-${item.gradeId}-${item.schoolMonthId}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  public async findMonthlyFeeOnGradeById(id: number, includeDeleted: boolean) {
    if (id == null || isNaN(id)) {
      throw new Error(`Invalid id: ${id}`);
    }
    return await this.prisma.monthlyFeeOnGrade.findUnique({
      where: {
        ...(includeDeleted ? {} : { deletedAt: null }),
        id,
      },
      include: {
        monthlyFee: true,
        grade: true,
        effectiveFromMonth: true,
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
    return searchWithPaginationAndCriteria<MonthlyFeeOnGrade>(
      this.prisma.monthlyFeeOnGrade.findMany,
      this.prisma.monthlyFeeOnGrade.similarity,
      {
        ...args,
        where: { ...args.where },
        include: {
          monthlyFee: true,
          grade: true,
          effectiveFromMonth: true,
        },
        omit: {
          monthlyFeeId: true,
          gradeId: true,
          schoolMonthId: true,
        },
      }
    );
  }

  public async getEffectiveMonthlyFee(gradeId: number, schoolMonthId: number) {
    const schoolMonth = await this.prisma.schoolMonth.findUnique({
      where: { id: schoolMonthId },
      select: {
        schoolPeriodId: true,
        month: true,
        schoolPeriod: {
          select: { schoolYear: { select: { startDate: true } } },
        },
      },
    });

    if (!schoolMonth) {
      return null;
    }

    return await this.prisma.monthlyFeeOnGrade.findFirst({
      where: {
        gradeId: gradeId,
        deletedAt: null,
        effectiveFromMonth: {
          schoolPeriod: {
            schoolYear: {
              startDate: {
                lte: schoolMonth.schoolPeriod.schoolYear.startDate,
              },
            },
          },
          month: {
            lte: schoolMonth.month,
          },
        },
      },
      orderBy: [
        {
          effectiveFromMonth: {
            schoolPeriod: {
              schoolYear: {
                startDate: "desc",
              },
            },
          },
        },
        {
          effectiveFromMonth: {
            month: "desc",
          },
        },
      ],
      include: {
        monthlyFee: true,
        grade: true,
        effectiveFromMonth: {
          include: {
            schoolPeriod: {
              include: {
                schoolYear: true,
              },
            },
          },
        },
      },
    });
  }
}
