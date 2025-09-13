import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { ExtendedPrisma } from "../config/container";
import { DiscountFeature } from "./discount.feature";
import { MonthlyFeeFeature } from "./monthlyFee.feature";
import createHttpError from "http-errors";
import { Decimal } from "@prisma/client/runtime/library";

@injectable()
export class ReportsFeature {
  constructor(
    @inject(TYPES.Prisma) private readonly prisma: ExtendedPrisma,
    @inject(TYPES.DiscountFeature)
    private readonly discountFeature: DiscountFeature,
    @inject(TYPES.MonthlyFeeFeature)
    private readonly monthlyFeeFeature: MonthlyFeeFeature
  ) {}

  public async getStudentTotalMonthlyFee(
    gradeId: number,
    studentId: number,
    periodId: number
  ) {
    const monthlyFee = await this.monthlyFeeFeature.getEffectiveMonthlyFee(
      gradeId,
      periodId
    );

    const discounts = await this.discountFeature.listStudentPeriodDiscounts(
      studentId,
      periodId
    );

    if (!monthlyFee)
      throw createHttpError(404, "Mensualidad efectiva no encontrada.");

    let total = monthlyFee.monthlyFee.amount;

    total = discounts.reduce((acc, studentPeriodDiscount) => {
      const discount = studentPeriodDiscount.discount;
      const amount = discount.amount;

      if (discount.isPercentage) {
        return acc.mul(new Decimal(1).minus(amount.div(100)));
      } else {
        return acc.minus(amount);
      }
    }, total);

    if (total.lessThan(0)) total = new Decimal(0);

    return total;
  }

  public async getPeriodRevenue(periodId: number) {
    const payment = await this.prisma.payment.aggregate({
      where: { schoolPeriodId: periodId, deletedAt: null },
      _sum: {
        amount: true,
      },
    });

    const totalRevenue = payment._sum.amount ?? new Decimal(0);

    const studentGrades = await this.prisma.studentGrade.findMany({
      where: {
        deletedAt: null,
        schoolYear: {
          deletedAt: null,
          SchoolPeriod: {
            some: { id: periodId, deletedAt: null },
          },
        },
      },
      include: {
        student: true,
        grade: true,
      },
    });

    let expectedRevenue = new Decimal(0);
    for (const studentGrade of studentGrades) {
      const studentFee = await this.getStudentTotalMonthlyFee(
        studentGrade.gradeId,
        studentGrade.studentId,
        periodId
      );
      expectedRevenue = expectedRevenue.plus(studentFee);
    }

    return {
      expectedRevenue: expectedRevenue,
      totalRevenue: totalRevenue,
    };
  }

  public async getStudentDue(periodId: number, studentId: number) {
    const studentGrade = await this.prisma.studentGrade.findFirstOrThrow({
      where: {
        deletedAt: null,
        studentId,
        schoolYear: {
          deletedAt: null,
          SchoolPeriod: {
            some: {
              id: periodId,
              deletedAt: null,
            },
          },
        },
      },
      select: {
        gradeId: true,
      },
    });

    const totalMonthlyFee = await this.getStudentTotalMonthlyFee(
      studentGrade.gradeId,
      studentId,
      periodId
    );

    const totalStudentPayments = await this.prisma.payment.aggregate({
      where: {
        studentId,
        schoolPeriodId: periodId,
        deletedAt: null,
        verified: {
          not: false,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalPaid = totalStudentPayments._sum.amount ?? new Decimal(0);

    const due = totalMonthlyFee.minus(totalPaid);

    return {
      totalPaid,
      totalMonthlyFee,
      due,
    };
  }
}
