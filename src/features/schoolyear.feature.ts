import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { PrismaClient, SchoolYear } from "@prisma/client";
import {
  SearchArgs,
  SearchResult,
  searchWithPaginationAndCriteria,
} from "../lib/search";
import createHttpError from "http-errors";

@injectable()
export class SchoolYearFeature {
  constructor(
    @inject(TYPES.Prisma)
    private readonly prisma: PrismaClient
  ) {}

  public async create(
    name: string,
    startDate: Date,
    endDate: Date
  ): Promise<SchoolYear> {
    return await this.prisma.schoolYear.create({
      data: {
        name,
        startDate,
        endDate,
      },
    });
  }

  public async update(
    id: number,
    data: {
      name?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<SchoolYear> {
    const schoolYear = await this.prisma.schoolYear.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!schoolYear) throw createHttpError(404, "Año escolar no encontrado.");

    const start = data.startDate ?? schoolYear.startDate;
    const end = data.endDate ?? schoolYear.endDate;

    if (start.getTime() > end.getTime()) {
      throw createHttpError(
        400,
        "El año de inicio no puede ser mayor al año de finalización."
      );
    }

    return await this.prisma.schoolYear.update({
      where: {
        id,
        deletedAt: null,
      },
      data,
    });
  }

  public async softDelete(id: number): Promise<SchoolYear> {
    return await this.prisma.schoolYear.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  public async hardDelete(id: number): Promise<SchoolYear> {
    return await this.prisma.schoolYear.delete({
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
    return searchWithPaginationAndCriteria(
      this.prisma.schoolYear.findMany,
      this.prisma.schoolYear.count,
      {
        ...args,
        where: { ...args.where, deletedAt: null },
      }
    );
  }
}
