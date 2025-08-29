import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { PrismaClient } from "@prisma/client";
import createHttpError from "http-errors";

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

  public async updateGrade(id: number, name: string) {
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

  public async softDeleteGrade(id: number) {
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

  public async hardDeleteGrade(id: number) {
    return this.prisma.grade.delete({
      where: {
        id,
      },
    });
  }
}
