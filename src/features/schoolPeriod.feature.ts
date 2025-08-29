import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { PrismaClient, SchoolPeriod } from "@prisma/client";
import createHttpError from "http-errors";

@injectable()
export class SchoolPeriodFeature {
  constructor(@inject(TYPES.Prisma) private readonly prisma: PrismaClient) {}

  async create(schoolYearId: number, month: number): Promise<SchoolPeriod> {
    if (month < 1 || month > 12) {
      throw createHttpError(400, "El mes debe estar entre 1 y 12.");
    }

    const existentSchoolPeriod = await this.prisma.schoolPeriod.count({
      where: {
        schoolYear: {
          id: schoolYearId,
        },
        month,
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
      },
    });
  }
}
