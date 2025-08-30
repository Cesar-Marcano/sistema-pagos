import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { Grade, PrismaClient } from "@prisma/client";
import createHttpError from "http-errors";
import {
  SearchArgs,
  SearchResult,
  searchWithPaginationAndCriteria,
} from "../lib/search";

@injectable()
export class GradeFeature {
  constructor(@inject(TYPES.Prisma) private readonly prisma: PrismaClient) {}

  public async create(name: string) {
    const existingGrades = await this.prisma.grade.count({
      where: {
        name,
        deletedAt: null,
      },
    });

    if (existingGrades > 0)
      throw createHttpError(409, "Ya existe un grado con ese nombre.");

    return this.prisma.grade.create({
      data: {
        name,
      },
    });
  }

  public async update(id: number, name: string) {
    const existingGrades = await this.prisma.grade.count({
      where: {
        name,
        deletedAt: null,
      },
    });

    if (existingGrades > 0)
      throw createHttpError(409, "Ya existe un grado con ese nombre.");

    return this.prisma.grade.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        name,
      },
    });
  }

  public async softDelete(id: number) {
    return this.prisma.grade.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  public async hardDelete(id: number) {
    return this.prisma.grade.delete({
      where: {
        id,
        deletedAt: {
          not: null,
        },
      },
    });
  }

  public async findById(id: number, includeDeleted: boolean) {
    return this.prisma.grade.findUnique({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  public async search(
    args: SearchArgs<
      Partial<Omit<Grade, "id" | "deletedAt" | "createdAt" | "updatedAt">> & {
        deletedAt?: {
          not: null;
        };
      }
    >
  ): Promise<SearchResult<Grade>> {
    return searchWithPaginationAndCriteria(
      this.prisma.grade.findMany,
      this.prisma.grade.count,
      {
        ...args,
        where: { ...args.where },
      }
    );
  }
}
