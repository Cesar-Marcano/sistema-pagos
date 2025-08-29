import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { PrismaClient, SchoolPeriod, SchoolYear } from "@prisma/client";
import createHttpError from "http-errors";
import { differenceInMonths } from "date-fns";
import {
  SearchArgs,
  SearchResult,
  searchWithPaginationAndCriteria,
} from "../lib/search";

@injectable()
export class SchoolPeriodFeature {
  constructor(@inject(TYPES.Prisma) private readonly prisma: PrismaClient) {}

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

    return await this.prisma.schoolPeriod.create({
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

    return await this.prisma.schoolPeriod.update({
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
  }

  public async softDelete(id: number): Promise<SchoolPeriod> {
    return await this.prisma.schoolPeriod.update({
      where: { id, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }

  public async hardDelete(id: number): Promise<SchoolPeriod> {
    return await this.prisma.schoolPeriod.delete({
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
    return searchWithPaginationAndCriteria(
      this.prisma.schoolPeriod.findMany,
      this.prisma.schoolPeriod.count,
      {
        ...args,
        where: { ...args.where, deletedAt: null },
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
