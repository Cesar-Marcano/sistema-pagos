import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { PrismaClient, SchoolYear } from "@prisma/client";
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
}
