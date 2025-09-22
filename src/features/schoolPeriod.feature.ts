import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import {
  AuditableEntities,
  AuditLogActions,
  SchoolPeriod,
  Settings,
} from "@prisma/client";
import {
  SearchArgs,
  SearchResult,
  searchWithPaginationAndCriteria,
} from "../lib/search";
import createHttpError from "http-errors";
import { ExtendedPrisma } from "../config/container";
import { AuditLogService } from "../services/auditLog.service";
import { calculateRelativeMonth } from "../lib/dateUtils";
import { SettingsService } from "../services/settings.service";

@injectable()
export class SchoolPeriodFeature {
  constructor(
    @inject(TYPES.Prisma)
    private readonly prisma: ExtendedPrisma,
    @inject(TYPES.AuditLogService)
    private readonly auditLogService: AuditLogService,
    @inject(TYPES.SettingsService)
    private readonly settingsService: SettingsService
  ) {}

  public async create(
    name: string,
    schoolYearId: number
  ): Promise<SchoolPeriod> {
    const schoolYear = await this.prisma.schoolYear.findUnique({
      where: {
        id: schoolYearId,
        deletedAt: null,
      },
    });

    if (!schoolYear) {
      throw createHttpError(404, "Año escolar no encontrado.");
    }

    const existingPeriod = await this.prisma.schoolPeriod.count({
      where: {
        name,
        schoolYearId,
        deletedAt: null,
      },
    });

    if (existingPeriod > 0) {
      throw createHttpError(
        409,
        "Ya existe un período escolar con este nombre para el año escolar especificado."
      );
    }

    const schoolPeriod = await this.prisma.schoolPeriod.create({
      data: {
        name,
        schoolYearId,
      },
      include: {
        schoolYear: true,
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
    data: Partial<{
      name: string;
      schoolYearId: number;
    }>
  ): Promise<SchoolPeriod> {
    const schoolPeriod = await this.prisma.schoolPeriod.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!schoolPeriod) {
      throw createHttpError(404, "Período escolar no encontrado.");
    }

    if (data.schoolYearId && data.schoolYearId !== schoolPeriod.schoolYearId) {
      const schoolYear = await this.prisma.schoolYear.findUnique({
        where: {
          id: data.schoolYearId,
          deletedAt: null,
        },
      });

      if (!schoolYear) {
        throw createHttpError(404, "Año escolar no encontrado.");
      }
    }

    if (data.name && data.name !== schoolPeriod.name) {
      const targetSchoolYearId = data.schoolYearId ?? schoolPeriod.schoolYearId;
      const existingPeriod = await this.prisma.schoolPeriod.count({
        where: {
          name: data.name,
          schoolYearId: targetSchoolYearId,
          deletedAt: null,
          id: {
            not: id,
          },
        },
      });

      if (existingPeriod > 0) {
        throw createHttpError(
          409,
          "Ya existe un período escolar con este nombre para el año escolar especificado."
        );
      }
    }

    const updatedSchoolPeriod = await this.prisma.schoolPeriod.update({
      where: {
        id,
        deletedAt: null,
      },
      data,
      include: {
        schoolYear: true,
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.SCHOOL_PERIOD,
      AuditLogActions.UPDATE,
      { data }
    );

    return updatedSchoolPeriod;
  }

  public async softDelete(id: number): Promise<SchoolPeriod> {
    const schoolPeriod = await this.prisma.schoolPeriod.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
      include: {
        schoolYear: true,
      },
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
      include: {
        schoolYear: true,
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
      include: {
        schoolYear: true,
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
      this.prisma.schoolPeriod.findMany.bind(this.prisma.schoolPeriod),
      this.prisma.schoolPeriod.similarity.bind(this.prisma.schoolPeriod),
      {
        ...args,
        where: { ...args.where },
        include: {
          schoolYear: true,
        },
      },
      await this.settingsService.get(Settings.SEARCH_THRESHOLD)
    );
  }

  public async getActualPeriod(): Promise<SchoolPeriod | null> {
    const today = new Date();

    const schoolYear = await this.prisma.schoolYear.findFirst({
      where: {
        startDate: { lte: today },
        endDate: { gte: today },
        deletedAt: null,
      },
    });

    if (!schoolYear) {
      return null;
    }

    const relativeMonth = calculateRelativeMonth(schoolYear.startDate, today);

    const schoolMonth = await this.prisma.schoolMonth.findFirst({
      where: {
        schoolPeriod: {
          schoolYearId: schoolYear.id,
          deletedAt: null,
        },
        month: relativeMonth,
        deletedAt: null,
      },
      include: { schoolPeriod: true },
    });

    return schoolMonth?.schoolPeriod ?? null;
  }

  public async isLastMonthOfPeriod(
    schoolPeriodId: number,
    monthId: number
  ): Promise<boolean> {
    const maxMonth = await this.prisma.schoolMonth.findFirst({
      where: {
        schoolPeriodId,
        deletedAt: null,
      },
      orderBy: {
        month: 'desc',
      },
      select: {
        id: true,
      },
    });

    return maxMonth ? maxMonth.id === monthId : false;
  }

  public async getNextPeriod(schoolPeriodId: number): Promise<SchoolPeriod | null> {
    const currentPeriod = await this.prisma.schoolPeriod.findUnique({
      where: {
        id: schoolPeriodId,
        deletedAt: null,
      },
    });

    if (!currentPeriod) {
      return null;
    }

    const nextPeriod = await this.prisma.schoolPeriod.findFirst({
      where: {
        schoolYearId: currentPeriod.schoolYearId,
        createdAt: {
          gt: currentPeriod.createdAt,
        },
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        schoolYear: true,
      },
    });

    return nextPeriod;
  }
}
