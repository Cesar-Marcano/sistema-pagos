import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { PrismaClient } from "@prisma/client";
import createHttpError from "http-errors";

@injectable()
export class MonthlyFeeFeature {
  constructor(@inject(TYPES.Prisma) private readonly prisma: PrismaClient) {}

  public async create(
    description: string,
    amount: number,
    effectiveFromPeriodId: number
  ) {
    const existentMonthlyFeeWithDescriptionCount =
      await this.prisma.monthlyFee.count({
        where: {
          description,
          deletedAt: null,
        },
      });

    if (existentMonthlyFeeWithDescriptionCount > 0)
      throw createHttpError(
        409,
        "Ya hay una mensualidad con la misma descripción."
      );

    return await this.prisma.monthlyFee.create({
      data: {
        description,
        amount,
        effectiveFrom: {
          connect: {
            id: effectiveFromPeriodId,
          },
        },
      },
    });
  }
}
