import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import {
  AuditableEntities,
  AuditLogActions,
  SchoolMonth,
  SchoolYear,
} from "@prisma/client";
import createHttpError from "http-errors";
import {
  SearchArgs,
  SearchResult,
  searchWithPaginationAndCriteria,
} from "../lib/search";
import { ExtendedPrisma } from "../config/container";
import { AuditLogService } from "../services/auditLog.service";
import { differenceInMonths, format, addMonths } from "date-fns";
import { es } from "date-fns/locale";
import logger from "../app/logger";

@injectable()
export class SchoolMonthFeature {
  constructor(
    @inject(TYPES.Prisma) private readonly prisma: ExtendedPrisma,
    @inject(TYPES.AuditLogService)
    private readonly auditLogService: AuditLogService
  ) {}

  public async create(
    schoolPeriodId: number,
    month: number,
    name?: string
  ): Promise<SchoolMonth> {
    const schoolPeriod = await this.prisma.schoolPeriod.findUnique({
      where: { id: schoolPeriodId, deletedAt: null },
      include: { schoolYear: true },
    });

    if (!schoolPeriod)
      throw createHttpError(404, "Período escolar no encontrado.");

    this.validateMonth(schoolPeriod.schoolYear, month);

    const existentSchoolMonth = await this.prisma.schoolMonth.count({
      where: {
        schoolPeriodId,
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
        schoolPeriod: {
          connect: {
            id: schoolPeriodId,
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
    data: Partial<{ schoolPeriodId: number; month: number; name: string }>
  ): Promise<SchoolMonth> {
    const existingSchoolMonth = await this.prisma.schoolMonth.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        schoolPeriod: {
          include: {
            schoolYear: true,
          },
        },
      },
    });

    if (!existingSchoolMonth) {
      throw createHttpError(404, "El mes escolar no fue encontrado.");
    }

    const newSchoolPeriodId =
      data.schoolPeriodId ?? existingSchoolMonth.schoolPeriodId;
    const newMonth = data.month ?? existingSchoolMonth.month;

    let targetSchoolPeriod = existingSchoolMonth.schoolPeriod;
    if (
      data.schoolPeriodId &&
      data.schoolPeriodId !== existingSchoolMonth.schoolPeriodId
    ) {
      const foundSchoolPeriod = await this.prisma.schoolPeriod.findUnique({
        where: { id: newSchoolPeriodId, deletedAt: null },
        include: { schoolYear: true },
      });
      if (!foundSchoolPeriod) {
        throw createHttpError(
          404,
          "El nuevo período escolar no fue encontrado."
        );
      }
      targetSchoolPeriod = foundSchoolPeriod;
    }

    if (data.month !== undefined) {
      this.validateMonth(targetSchoolPeriod.schoolYear, newMonth);
    }

    if (data.name !== undefined && data.name.trim() === "") {
      throw createHttpError(400, "El nombre no puede estar vacío.");
    }

    if (
      newSchoolPeriodId !== existingSchoolMonth.schoolPeriodId ||
      newMonth !== existingSchoolMonth.month
    ) {
      const existingMonth = await this.prisma.schoolMonth.count({
        where: {
          schoolPeriodId: newSchoolPeriodId,
          month: newMonth,
          deletedAt: null,
          NOT: {
            id,
          },
        },
      });

      if (existingMonth > 0) {
        throw createHttpError(
          409,
          "La combinación de período y mes ya existe."
        );
      }
    }

    const schoolMonth = await this.prisma.schoolMonth.update({
      where: {
        id,
      },
      data: {
        schoolPeriod: {
          connect: {
            id: newSchoolPeriodId,
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
        schoolPeriod?: {
          schoolYearId?: number;
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

  public async generateSchoolMonths(schoolPeriods: {
    firstPeriod: number;
    secondPeriod: number;
    thirdPeriod: number;
  }): Promise<any> {
    const firstSchoolPeriod = await this.prisma.schoolPeriod.findUnique({
      where: { id: schoolPeriods.firstPeriod, deletedAt: null },
      include: { schoolYear: true },
    });

    const secondSchoolPeriod = await this.prisma.schoolPeriod.findUnique({
      where: { id: schoolPeriods.secondPeriod, deletedAt: null },
      include: { schoolYear: true },
    });

    const thirdSchoolPeriod = await this.prisma.schoolPeriod.findUnique({
      where: { id: schoolPeriods.thirdPeriod, deletedAt: null },
      include: { schoolYear: true },
    });

    if (!firstSchoolPeriod || !secondSchoolPeriod || !thirdSchoolPeriod) {
      throw createHttpError(
        404,
        "Uno o más períodos escolares no fueron encontrados."
      );
    }

    const totalMonths = differenceInMonths(
      firstSchoolPeriod.schoolYear.endDate,
      firstSchoolPeriod.schoolYear.startDate
    );

    const existingMonthsCount = await this.prisma.schoolMonth.count({
      where: {
        OR: [
          { schoolPeriodId: firstSchoolPeriod.id },
          { schoolPeriodId: secondSchoolPeriod.id },
          { schoolPeriodId: thirdSchoolPeriod.id },
        ],
        deletedAt: null,
      },
    });

    if (existingMonthsCount > 0) {
      throw createHttpError(
        409,
        "Ya existen meses escolares para uno o más de los períodos seleccionados. Use la opción de actualización en su lugar."
      );
    }

    const monthsToCreate: any[] = [];
    let currentDate = new Date(firstSchoolPeriod.schoolYear.startDate);

    for (let i = 0; i < totalMonths; i++) {
      const monthNumber = i + 1;
      let schoolPeriodId: number;

      if (monthNumber >= 1 && monthNumber <= 4) {
        schoolPeriodId = firstSchoolPeriod.id;
      } else if (monthNumber >= 5 && monthNumber <= 7) {
        schoolPeriodId = secondSchoolPeriod.id;
      } else if (monthNumber >= 8 && monthNumber <= 12) {
        schoolPeriodId = thirdSchoolPeriod.id;
      } else {
        logger.warn(
          `El mes número ${monthNumber} no tiene un lapso asignado y será omitido.`
        );
        currentDate = addMonths(currentDate, 1);
        continue;
      }

      const monthName = format(currentDate, "MMMM yyyy", { locale: es }).toUpperCase();

      monthsToCreate.push({
        schoolPeriodId,
        month: currentDate.getMonth() + 1,
        name: monthName,
      });

      currentDate = addMonths(currentDate, 1);
    }

    if (monthsToCreate.length > 0) {
      await this.prisma.schoolMonth.createMany({
        data: monthsToCreate,
        skipDuplicates: true,
      });

      this.auditLogService.createLog(
        AuditableEntities.SCHOOL_MONTH,
        AuditLogActions.CREATE,
        {
          generatedMonths: monthsToCreate.length,
          action: "BATCH_CREATE",
          schoolYearId: firstSchoolPeriod.schoolYear.id,
        }
      );
    }

    const createdMonths = await this.prisma.schoolMonth.findMany({
      where: {
        OR: [
          { schoolPeriodId: firstSchoolPeriod.id },
          { schoolPeriodId: secondSchoolPeriod.id },
          { schoolPeriodId: thirdSchoolPeriod.id },
        ],
        deletedAt: null,
      },
      orderBy: { createdAt: "asc" },
    });

    return createdMonths;
  }
}
