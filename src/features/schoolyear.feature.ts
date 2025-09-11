import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import {
  AuditableEntities,
  AuditLogActions,
  PrismaClient,
  SchoolYear,
} from "@prisma/client";
import {
  SearchArgs,
  SearchResult,
  searchWithPaginationAndCriteria,
} from "../lib/search";
import createHttpError from "http-errors";
import { ExtendedPrisma } from "../config/container";
import { AuditLogService } from "../services/auditLog.service";

@injectable()
export class SchoolYearFeature {
  constructor(
    @inject(TYPES.Prisma)
    private readonly prisma: ExtendedPrisma,
    @inject(TYPES.AuditLogService)
    private readonly auditLogService: AuditLogService
  ) {}

  public async create(
    name: string,
    startDate: Date,
    endDate: Date
  ): Promise<SchoolYear> {
    const existingSchoolYear = await this.prisma.schoolYear.count({
      where: {
        name,
        deletedAt: null,
      },
    });

    if (existingSchoolYear > 0) {
      throw createHttpError(409, "Ya existe un año escolar con este nombre.");
    }

    const schoolYear = await this.prisma.schoolYear.create({
      data: {
        name,
        startDate,
        endDate,
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.SCHOOL_YEAR,
      AuditLogActions.CREATE,
      schoolYear
    );

    return schoolYear;
  }

  public async update(
    id: number,
    data: Partial<{
      name: string;
      startDate: Date;
      endDate: Date;
    }>
  ): Promise<SchoolYear> {
    const schoolYear = await this.prisma.schoolYear.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!schoolYear) {
      throw createHttpError(404, "Año escolar no encontrado.");
    }

    if (data.name && data.name !== schoolYear.name) {
      const existingSchoolYear = await this.prisma.schoolYear.count({
        where: {
          name: data.name,
          deletedAt: null,
        },
      });

      if (existingSchoolYear > 0) {
        throw createHttpError(409, "Ya existe un año escolar con este nombre.");
      }
    }

    const start = data.startDate ?? schoolYear.startDate;
    const end = data.endDate ?? schoolYear.endDate;

    if (start.getTime() > end.getTime()) {
      throw createHttpError(
        400,
        "El año de inicio no puede ser mayor al año de finalización."
      );
    }

    const updatedSchoolYear = await this.prisma.schoolYear.update({
      where: {
        id,
        deletedAt: null,
      },
      data,
    });

    this.auditLogService.createLog(
      AuditableEntities.SCHOOL_YEAR,
      AuditLogActions.UPDATE,
      { data }
    );

    return updatedSchoolYear;
  }

  public async softDelete(id: number): Promise<SchoolYear> {
    const schoolYear = await this.prisma.schoolYear.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.SCHOOL_YEAR,
      AuditLogActions.SOFT_DELETE,
      { deletedAt: schoolYear.deletedAt }
    );

    return schoolYear;
  }

  public async hardDelete(id: number): Promise<SchoolYear> {
    const schoolYear = await this.prisma.schoolYear.delete({
      where: {
        id,
        deletedAt: {
          not: null,
        },
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.SCHOOL_YEAR,
      AuditLogActions.DELETE,
      {}
    );

    return schoolYear;
  }

  public async findById(
    id: number,
    includeDeleted: boolean
  ): Promise<SchoolYear | null> {
    return await this.prisma.schoolYear.findUnique({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  public async search(
    args: SearchArgs<
      Partial<
        Omit<SchoolYear, "id" | "deletedAt" | "createdAt" | "updatedAt">
      > & {
        deletedAt?: {
          not: null;
        };
      }
    >
  ): Promise<SearchResult<SchoolYear>> {
    return searchWithPaginationAndCriteria<SchoolYear>(
      this.prisma.schoolYear.findMany.bind(this.prisma.schoolYear),
      this.prisma.schoolYear.similarity.bind(this.prisma.schoolYear),
      {
        ...args,
        where: { ...args.where },
      }
    );
  }
}
