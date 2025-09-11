import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import {
  AuditableEntities,
  AuditLogActions,
  SchoolPeriod,
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
export class SchoolPeriodFeature {
  constructor(
    @inject(TYPES.Prisma) private readonly prisma: ExtendedPrisma,
    @inject(TYPES.AuditLogService)
    private readonly auditLogService: AuditLogService
  ) {}

  public async create(
    schoolYearId: number,
    month: number,
    name?: string
  ): Promise<SchoolPeriod> {
    const schoolYear = await this.prisma.schoolYear.findUnique({
      where: { id: schoolYearId, deletedAt: null },
    });

    if (!schoolYear) throw createHttpError(404, "Año escolar no encontrado.");

    this.validateMonth(schoolYear, month);

    const existentSchoolPeriod = await this.prisma.schoolPeriod.count({
      where: {
        schoolYear: {
          id: schoolYearId,
        },
        month,
        deletedAt: null,
      },
    });

    if (existentSchoolPeriod > 0)
      throw createHttpError(
        409,
        "Periodo escolar con el mes indicado ya ha sido creado."
      );

    const schoolPeriod = await this.prisma.schoolPeriod.create({
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
      AuditableEntities.SCHOOL_PERIOD,
      AuditLogActions.CREATE,
      schoolPeriod
    );

    return schoolPeriod;
  }
  public async update(
    id: number,
    data: Partial<{ schoolYearId: number; month: number; name: string }>
  ): Promise<SchoolPeriod> {
    const period = await this.prisma.schoolPeriod.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        schoolYear: true,
      },
    });

    if (!period) {
      throw createHttpError(404, "El periodo escolar no fue encontrado.");
    }

    const newSchoolYearId = data.schoolYearId ?? period.schoolYearId;
    const newMonth = data.month ?? period.month;

    let targetSchoolYear: SchoolYear | null = period.schoolYear;
    if (data.schoolYearId && data.schoolYearId !== period.schoolYearId) {
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

    if (newSchoolYearId !== period.schoolYearId || newMonth !== period.month) {
      const existingPeriod = await this.prisma.schoolPeriod.count({
        where: {
          schoolYearId: newSchoolYearId,
          month: newMonth,
          deletedAt: null,
          NOT: {
            id,
          },
        },
      });

      if (existingPeriod > 0) {
        throw createHttpError(409, "La combinación de año y mes ya existe.");
      }
    }

    const schoolPeriod = await this.prisma.schoolPeriod.update({
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
        name: data.name ?? period.name,
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.SCHOOL_PERIOD,
      AuditLogActions.UPDATE,
      data
    );

    return schoolPeriod;
  }

  public async softDelete(id: number): Promise<SchoolPeriod> {
    const schoolPeriod = await this.prisma.schoolPeriod.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    this.auditLogService.createLog(
      AuditableEntities.SCHOOL_PERIOD,
      AuditLogActions.SOFT_DELETE,
      { deletedAt: schoolPeriod.deletedAt }
    );

    return schoolPeriod;
  }

  public async hardDelete(id: number): Promise<SchoolPeriod> {
    const schoolPeriod = await this.prisma.schoolPeriod.delete({
      where: {
        id,
        deletedAt: {
          not: null,
        },
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.SCHOOL_PERIOD,
      AuditLogActions.DELETE,
      {}
    );

    return schoolPeriod;
  }

  public async findById(
    id: number,
    includeDeleted: boolean
  ): Promise<SchoolPeriod | null> {
    return await this.prisma.schoolPeriod.findUnique({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  public async search(
    args: SearchArgs<
      Partial<
        Omit<SchoolPeriod, "id" | "deletedAt" | "createdAt" | "updatedAt">
      > & {
        deletedAt?: {
          not: null;
        };
      }
    >
  ): Promise<SearchResult<SchoolPeriod>> {
    return searchWithPaginationAndCriteria<SchoolPeriod>(
      this.prisma.schoolPeriod.findMany,
      this.prisma.schoolPeriod.similarity,
      {
        ...args,
        where: { ...args.where },
      }
    );
  }

  private validateMonth(schoolYear: SchoolYear, month: number): void {
    const maxSchoolarMonthsInYear = differenceInMonths(
      schoolYear.endDate,
      schoolYear.startDate
    );
    if (month < 1 || month > maxSchoolarMonthsInYear) {
      throw createHttpError(
        400,
        `El mes debe estar entre 1 y ${maxSchoolarMonthsInYear}.`
      );
    }
  }
}
