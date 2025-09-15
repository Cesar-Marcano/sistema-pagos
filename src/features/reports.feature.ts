import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { ExtendedPrisma } from "../config/container";
import { DiscountFeature } from "./discount.feature";
import { MonthlyFeeFeature } from "./monthlyFee.feature";
import createHttpError from "http-errors";
import { Decimal } from "@prisma/client/runtime/library";
import { SettingsService } from "../services/settings.service";

@injectable()
export class ReportsFeature {
  constructor(
    @inject(TYPES.Prisma) private readonly prisma: ExtendedPrisma,
    @inject(TYPES.DiscountFeature)
    private readonly discountFeature: DiscountFeature,
    @inject(TYPES.MonthlyFeeFeature)
    private readonly monthlyFeeFeature: MonthlyFeeFeature,
    @inject(TYPES.SettingsService)
    private readonly settingsService: SettingsService
  ) {}

  public async getStudentTotalMonthlyFee(
    gradeId: number,
    studentId: number,
    schoolMonthId: number
  ) {
    const monthlyFee = await this.monthlyFeeFeature.getEffectiveMonthlyFee(
      gradeId,
      schoolMonthId
    );

    const discounts = await this.discountFeature.listStudentMonthDiscounts(
      studentId,
      schoolMonthId
    );

    if (!monthlyFee)
      throw createHttpError(404, "Mensualidad efectiva no encontrada.");

    let total = monthlyFee.monthlyFee.amount;

    total = discounts.reduce((acc, studentMonthDiscount) => {
      const discount = studentMonthDiscount.discount;
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

  public async getMonthRevenue(schoolMonthId: number) {
    const payment = await this.prisma.payment.aggregate({
      where: { schoolMonthId: schoolMonthId, deletedAt: null },
      _sum: {
        amount: true,
      },
    });

    const totalRevenue = payment._sum.amount ?? new Decimal(0);

    const studentGrades = await this.prisma.studentGrade.findMany({
      where: {
        deletedAt: null,
        schoolPeriod: {
          deletedAt: null,
          SchoolMonth: {
            some: { id: schoolMonthId, deletedAt: null },
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
        schoolMonthId
      );
      expectedRevenue = expectedRevenue.plus(studentFee);
    }

    return {
      expectedRevenue: expectedRevenue,
      totalRevenue: totalRevenue,
    };
  }

  public async getStudentDue(schoolMonthId: number, studentId: number) {
    const studentGrade = await this.prisma.studentGrade.findFirstOrThrow({
      where: {
        deletedAt: null,
        studentId,
        schoolPeriod: {
          deletedAt: null,
          SchoolMonth: {
            some: {
              id: schoolMonthId,
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
      schoolMonthId
    );

    const totalStudentPayments = await this.prisma.payment.aggregate({
      where: {
        studentId,
        schoolMonthId: schoolMonthId,
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

  public async getStudentsInOverdue(schoolMonthId: number) {
    const paymentDueDay = await this.settingsService.get("PAYMENT_DUE_DAY");
    const daysUntilOverdue = await this.settingsService.get(
      "DAYS_UNTIL_OVERDUE"
    );

    const schoolMonth = await this.prisma.schoolMonth.findUniqueOrThrow({
      where: { id: schoolMonthId, deletedAt: null },
      include: { schoolPeriod: { include: { schoolYear: true } } },
    });

    const schoolMonthMonthDate = this.addMonths(
      schoolMonth.schoolPeriod.schoolYear.startDate,
      schoolMonth.month - 1
    );

    const dueDate = new Date(
      Date.UTC(
        schoolMonthMonthDate.getUTCFullYear(),
        schoolMonthMonthDate.getUTCMonth(),
        paymentDueDay
      )
    );

    const overdueDate = new Date(dueDate);
    overdueDate.setUTCDate(overdueDate.getUTCDate() + daysUntilOverdue);

    const today = new Date();

    const studentGrades = await this.prisma.studentGrade.findMany({
      where: {
        deletedAt: null,
        schoolPeriod: {
          deletedAt: null,
          SchoolMonth: { some: { id: schoolMonthId, deletedAt: null } },
        },
      },
      include: { student: true, grade: true },
    });

    const overdueStudents: any[] = [];

    for (const sg of studentGrades) {
      const totalFee = await this.getStudentTotalMonthlyFee(
        sg.gradeId,
        sg.studentId,
        schoolMonthId
      );

      const payments = await this.prisma.payment.aggregate({
        where: {
          studentId: sg.studentId,
          schoolMonthId: schoolMonthId,
          deletedAt: null,
          verified: { not: false },
        },
        _sum: { amount: true },
      });

      const paid = payments._sum.amount ?? new Decimal(0);

      if (paid.gte(totalFee)) continue;

      if (today >= overdueDate) {
        overdueStudents.push({
          studentId: sg.studentId,
          studentName: sg.student.name,
          grade: sg.grade.name,
          totalFee,
          paid,
          due: totalFee.minus(paid),
          status: "OVERDUE",
        });
      } else if (today >= dueDate) {
        overdueStudents.push({
          studentId: sg.studentId,
          studentName: sg.student.name,
          grade: sg.grade.name,
          totalFee,
          paid,
          due: totalFee.minus(paid),
          status: "DUE",
        });
      }
    }

    return overdueStudents;
  }

  private addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    d.setUTCMonth(d.getUTCMonth() + months);
    return d;
  }
}
