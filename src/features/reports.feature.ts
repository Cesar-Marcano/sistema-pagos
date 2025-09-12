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

    return total.toNumber();
  }
}
