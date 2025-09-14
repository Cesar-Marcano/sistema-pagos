import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import {
  AuditableEntities,
  AuditLogActions,
  SchoolMonth,
  SchoolYear,
} from "@prisma/client";
import createHttpError from "http-errors";
import { differenceInMonths } from "date-fns";
import {
  SearchArgs,
  SearchResult,
  searchWithPaginationAndCriteria,
} from "../lib/search";
import { ExtendedPrisma } from "../config/container";
import { AuditLogService } from "../services/auditLog.service";

@injectable()
export class SchoolMonthFeature {
  constructor(
    @inject(TYPES.Prisma) private readonly prisma: ExtendedPrisma,
    @inject(TYPES.AuditLogService)
    private readonly auditLogService: AuditLogService
  ) {}

  public async create(
    schoolYearId: number,
    month: number,
    name?: string
  ): Promise<SchoolMonth> {
    const schoolYear = await this.prisma.schoolYear.findUnique({
      where: { id: schoolYearId, deletedAt: null },
    });

    if (!schoolYear) throw createHttpError(404, "Año escolar no encontrado.");

    this.validateMonth(schoolYear, month);

    const existentSchoolMonth = await this.prisma.schoolMonth.count({
      where: {
        schoolYear: {
          id: schoolYearId,
        },
        month,
        deletedAt: null,
      },
    });

    if (existentSchoolMonth > 0)
      throw createHttpError(
        409,
        "Mes escolar con el mes indicado ya ha sido creado."
      );

    const schoolMonth = await this.prisma.schoolMonth.create({
      data: {
        schoolYear: {
          connect: {
            id: schoolYearId,
          },
        },
        month,
        name: name ?? null,
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.SCHOOL_MONTH,
      AuditLogActions.CREATE,
      schoolMonth
    );

    return schoolMonth;
  }
  public async update(
    id: number,
    data: Partial<{ schoolYearId: number; month: number; name: string }>
  ): Promise<SchoolMonth> {
    const existingSchoolMonth = await this.prisma.schoolMonth.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        schoolYear: true,
      },
    });

    if (!existingSchoolMonth) {
      throw createHttpError(404, "El mes escolar no fue encontrado.");
    }

    const newSchoolYearId = data.schoolYearId ?? existingSchoolMonth.schoolYearId;
    const newMonth = data.month ?? existingSchoolMonth.month;

    let targetSchoolYear: SchoolYear | null = existingSchoolMonth.schoolYear;
    if (data.schoolYearId && data.schoolYearId !== existingSchoolMonth.schoolYearId) {
      targetSchoolYear = await this.prisma.schoolYear.findUnique({
        where: { id: newSchoolYearId, deletedAt: null },
      });
      if (!targetSchoolYear) {
        throw createHttpError(404, "El nuevo año escolar no fue encontrado.");
      }
    }

    if (data.month !== undefined) {
      if (!targetSchoolYear) {
        throw createHttpError(
          500,
          "Error interno: No se pudo determinar el año escolar de destino."
        );
      }
      this.validateMonth(targetSchoolYear, newMonth);
    }

    if (data.name !== undefined && data.name.trim() === "") {
      throw createHttpError(400, "El nombre no puede estar vacío.");
    }

    if (newSchoolYearId !== existingSchoolMonth.schoolYearId || newMonth !== existingSchoolMonth.month) {
      const existingMonth = await this.prisma.schoolMonth.count({
        where: {
          schoolYearId: newSchoolYearId,
          month: newMonth,
          deletedAt: null,
          NOT: {
            id,
          },
        },
      });

      if (existingMonth > 0) {
        throw createHttpError(409, "La combinación de año y mes ya existe.");
      }
    }

    const schoolMonth = await this.prisma.schoolMonth.update({
      where: {
        id,
      },
      data: {
        schoolYear: {
          connect: {
            id: newSchoolYearId,
          },
        },
        month: newMonth,
        name: data.name ?? existingSchoolMonth.name,
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.SCHOOL_MONTH,
      AuditLogActions.UPDATE,
      data
    );

    return schoolMonth;
  }

  public async softDelete(id: number): Promise<SchoolMonth> {
    const schoolMonth = await this.prisma.schoolMonth.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    this.auditLogService.createLog(
      AuditableEntities.SCHOOL_MONTH,
      AuditLogActions.SOFT_DELETE,
      { deletedAt: schoolMonth.deletedAt }
    );

    return schoolMonth;
  }

  public async hardDelete(id: number): Promise<SchoolMonth> {
    const schoolMonth = await this.prisma.schoolMonth.delete({
      where: {
        id,
        deletedAt: {
          not: null,
        },
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.SCHOOL_MONTH,
      AuditLogActions.DELETE,
      {}
    );

    return schoolMonth;
  }

  public async findById(
    id: number,
    includeDeleted: boolean
  ): Promise<SchoolMonth | null> {
    return await this.prisma.schoolMonth.findUnique({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  public async search(
    args: SearchArgs<
      Partial<
        Omit<SchoolMonth, "id" | "deletedAt" | "createdAt" | "updatedAt">
      > & {
        deletedAt?: {
          not: null;
        };
      }
    >
  ): Promise<SearchResult<SchoolMonth>> {
    return searchWithPaginationAndCriteria<SchoolMonth>(
      this.prisma.schoolMonth.findMany,
      this.prisma.schoolMonth.similarity,
      {
        ...args,
        where: { ...args.where },
      }
    );
  }

  private validateMonth(schoolYear: SchoolYear, month: number): void {
    const maxSchoolMonthsInYear = differenceInMonths(
      schoolYear.endDate,
      schoolYear.startDate
    );
    if (month < 1 || month > maxSchoolMonthsInYear) {
      throw createHttpError(
        400,
        `El mes debe estar entre 1 y ${maxSchoolMonthsInYear}.`
      );
    }
  }
}
