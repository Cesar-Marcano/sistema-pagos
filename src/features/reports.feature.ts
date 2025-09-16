import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { ExtendedPrisma } from "../config/container";
import { DiscountFeature } from "./discount.feature";
import { MonthlyFeeFeature } from "./monthlyFee.feature";
import createHttpError from "http-errors";
import { Decimal } from "@prisma/client/runtime/library";
import { SettingsService } from "../services/settings.service";
import { Settings } from "@prisma/client";
import { isOverdue } from "../lib/isOverdue";

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

    if (!monthlyFee)
      throw createHttpError(404, "Mensualidad efectiva no encontrada.");

    // Get all applicable discounts for this student and month
    const discounts = await this.discountFeature.listStudentMonthDiscounts(
      studentId,
      schoolMonthId
    );

    let total = monthlyFee.monthlyFee.amount;
    let percentageDiscounts = new Decimal(0);
    let fixedDiscounts = new Decimal(0);

    // Separate percentage and fixed discounts for proper calculation
    discounts.forEach((studentMonthDiscount) => {
      const discount = studentMonthDiscount.discount;
      const amount = new Decimal(discount.amount);

      if (discount.isPercentage) {
        // Accumulate percentage discounts (they should be applied to the original amount)
        percentageDiscounts = percentageDiscounts.plus(amount);
      } else {
        // Accumulate fixed amount discounts
        fixedDiscounts = fixedDiscounts.plus(amount);
      }
    });

    // Apply percentage discounts first (on original amount)
    if (percentageDiscounts.greaterThan(0)) {
      // Cap percentage discounts at 100%
      if (percentageDiscounts.greaterThan(100)) {
        percentageDiscounts = new Decimal(100);
      }
      const discountAmount = total.mul(percentageDiscounts.div(100));
      total = total.minus(discountAmount);
    }

    // Apply fixed discounts
    if (fixedDiscounts.greaterThan(0)) {
      total = total.minus(fixedDiscounts);
    }

    // Ensure total never goes below zero
    if (total.lessThan(0)) total = new Decimal(0);

    return total;
  }

  public async getMonthRevenue(schoolMonthId: number) {
    const payment = await this.prisma.payment.aggregate({
      where: {
        schoolMonthId: schoolMonthId,
        deletedAt: null,
        verified: { not: false },
      },
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
    let totalDiscountsApplied = new Decimal(0);
    let originalExpectedRevenue = new Decimal(0);

    for (const studentGrade of studentGrades) {
      const monthlyFee = await this.monthlyFeeFeature.getEffectiveMonthlyFee(
        studentGrade.gradeId,
        schoolMonthId
      );

      if (monthlyFee) {
        originalExpectedRevenue = originalExpectedRevenue.plus(
          monthlyFee.monthlyFee.amount
        );
      }

      const studentFeeWithDiscounts = await this.getStudentTotalMonthlyFee(
        studentGrade.gradeId,
        studentGrade.studentId,
        schoolMonthId
      );

      expectedRevenue = expectedRevenue.plus(studentFeeWithDiscounts);

      if (monthlyFee) {
        const discountAmount = monthlyFee.monthlyFee.amount.minus(
          studentFeeWithDiscounts
        );
        totalDiscountsApplied = totalDiscountsApplied.plus(discountAmount);
      }
    }

    return {
      expectedRevenue: expectedRevenue,
      totalRevenue: totalRevenue,
      originalExpectedRevenue: originalExpectedRevenue,
      totalDiscountsApplied: totalDiscountsApplied,
      collectionRate: expectedRevenue.greaterThan(0)
        ? totalRevenue.div(expectedRevenue).mul(100)
        : new Decimal(0),
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
    const paymentDueDay = await this.settingsService.get(
      Settings.PAYMENT_DUE_DAY
    );
    const daysUntilOverdue = await this.settingsService.get(
      Settings.DAYS_UNTIL_OVERDUE
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
      include: {
        student: true,
        grade: true,
      },
    });

    const overdueStudents: any[] = [];

    for (const sg of studentGrades) {
      // Get total fee with discounts applied
      const totalFeeWithDiscounts = await this.getStudentTotalMonthlyFee(
        sg.gradeId,
        sg.studentId,
        schoolMonthId
      );

      // Get original fee without discounts for comparison
      const monthlyFee = await this.monthlyFeeFeature.getEffectiveMonthlyFee(
        sg.gradeId,
        schoolMonthId
      );
      const originalFee = monthlyFee?.monthlyFee.amount ?? new Decimal(0);

      // Get applied discounts for this student
      const discounts = await this.discountFeature.listStudentMonthDiscounts(
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
      const discountAmount = originalFee.minus(totalFeeWithDiscounts);

      // Skip if student has paid the full amount (with discounts applied)
      if (paid.gte(totalFeeWithDiscounts)) continue;

      const studentData = {
        studentId: sg.studentId,
        studentName: sg.student.name,
        grade: sg.grade.name,
        originalFee: originalFee,
        totalFee: totalFeeWithDiscounts,
        discountAmount: discountAmount,
        discountsApplied: discounts.map((d) => ({
          name: d.discount.name,
          amount: d.discount.amount,
          isPercentage: d.discount.isPercentage,
        })),
        paid,
        due: totalFeeWithDiscounts.minus(paid),
        dueDate,
        overdueDate,
      };

      if (today >= overdueDate) {
        overdueStudents.push({
          ...studentData,
          status: "OVERDUE",
          daysOverdue: Math.floor(
            (today.getTime() - overdueDate.getTime()) / (1000 * 60 * 60 * 24)
          ),
        });
      } else if (today >= dueDate) {
        overdueStudents.push({
          ...studentData,
          status: "DUE",
          daysPastDue: Math.floor(
            (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
          ),
        });
      }
    }

    return overdueStudents;
  }

  public async getDiscountReport(schoolMonthId: number) {
    // Get all student grades for this school month
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

    const discountSummary = {
      totalStudents: studentGrades.length,
      studentsWithDiscounts: 0,
      totalOriginalAmount: new Decimal(0),
      totalDiscountAmount: new Decimal(0),
      totalFinalAmount: new Decimal(0),
      discountsByType: {} as Record<
        string,
        {
          count: number;
          totalAmount: Decimal;
          students: string[];
        }
      >,
      studentDetails: [] as any[],
    };

    for (const sg of studentGrades) {
      // Get original monthly fee
      const monthlyFee = await this.monthlyFeeFeature.getEffectiveMonthlyFee(
        sg.gradeId,
        schoolMonthId
      );

      if (!monthlyFee) continue;

      const originalAmount = monthlyFee.monthlyFee.amount;
      discountSummary.totalOriginalAmount =
        discountSummary.totalOriginalAmount.plus(originalAmount);

      // Get discounts applied
      const discounts = await this.discountFeature.listStudentMonthDiscounts(
        sg.studentId,
        schoolMonthId
      );

      // Calculate final amount with discounts
      const finalAmount = await this.getStudentTotalMonthlyFee(
        sg.gradeId,
        sg.studentId,
        schoolMonthId
      );

      const discountAmount = originalAmount.minus(finalAmount);
      discountSummary.totalFinalAmount =
        discountSummary.totalFinalAmount.plus(finalAmount);
      discountSummary.totalDiscountAmount =
        discountSummary.totalDiscountAmount.plus(discountAmount);

      if (discounts.length > 0) {
        discountSummary.studentsWithDiscounts++;
      }

      // Track discounts by type
      discounts.forEach((studentDiscount) => {
        const discount = studentDiscount.discount;
        const key = `${discount.name} (${
          discount.isPercentage ? discount.amount + "%" : "$" + discount.amount
        })`;

        if (!discountSummary.discountsByType[key]) {
          discountSummary.discountsByType[key] = {
            count: 0,
            totalAmount: new Decimal(0),
            students: [],
          };
        }

        discountSummary.discountsByType[key].count++;
        discountSummary.discountsByType[key].students.push(sg.student.name);

        // Calculate actual discount amount for this student
        let actualDiscountAmount = new Decimal(0);
        if (discount.isPercentage) {
          actualDiscountAmount = originalAmount.mul(
            new Decimal(discount.amount).div(100)
          );
        } else {
          actualDiscountAmount = new Decimal(discount.amount);
        }
        discountSummary.discountsByType[key].totalAmount =
          discountSummary.discountsByType[key].totalAmount.plus(
            actualDiscountAmount
          );
      });

      // Add student details
      discountSummary.studentDetails.push({
        studentId: sg.studentId,
        studentName: sg.student.name,
        grade: sg.grade.name,
        originalAmount,
        finalAmount,
        discountAmount,
        discountsApplied: discounts.map((d) => ({
          name: d.discount.name,
          amount: d.discount.amount,
          isPercentage: d.discount.isPercentage,
          description: d.discount.description,
        })),
      });
    }

    // Calculate percentages
    const discountPercentage = discountSummary.totalOriginalAmount.greaterThan(
      0
    )
      ? discountSummary.totalDiscountAmount
          .div(discountSummary.totalOriginalAmount)
          .mul(100)
      : new Decimal(0);

    const studentsWithDiscountsPercentage =
      discountSummary.totalStudents > 0
        ? new Decimal(discountSummary.studentsWithDiscounts)
            .div(discountSummary.totalStudents)
            .mul(100)
        : new Decimal(0);

    return {
      ...discountSummary,
      discountPercentage,
      studentsWithDiscountsPercentage,
      averageDiscountPerStudent:
        discountSummary.studentsWithDiscounts > 0
          ? discountSummary.totalDiscountAmount.div(
              discountSummary.studentsWithDiscounts
            )
          : new Decimal(0),
    };
  }

  public async getStudentPaymentHistory(
    studentId: number,
    schoolYearId?: number
  ) {
    const whereClause: any = {
      studentId,
      deletedAt: null,
    };

    if (schoolYearId) {
      whereClause.schoolMonth = {
        schoolPeriod: {
          schoolYear: {
            id: schoolYearId,
          },
        },
      };
    }

    const payments = await this.prisma.payment.findMany({
      where: whereClause,
      include: {
        schoolMonth: {
          include: {
            schoolPeriod: {
              include: {
                schoolYear: true,
              },
            },
          },
        },
        paymentMethod: true,
      },
      orderBy: [
        {
          schoolMonth: { schoolPeriod: { schoolYear: { startDate: "desc" } } },
        },
        { schoolMonth: { month: "asc" } },
        { createdAt: "desc" },
      ],
    });

    const paymentHistory = [];

    for (const payment of payments) {
      // Get student grade for this payment's school month
      const studentGrade = await this.prisma.studentGrade.findFirst({
        where: {
          studentId,
          schoolPeriod: {
            id: payment.schoolMonth.schoolPeriodId,
          },
          deletedAt: null,
        },
        include: {
          grade: true,
        },
      });

      if (!studentGrade) continue;

      // Get expected amount with discounts
      const expectedAmount = await this.getStudentTotalMonthlyFee(
        studentGrade.gradeId,
        studentId,
        payment.schoolMonthId
      );

      // Get original amount without discounts
      const monthlyFee = await this.monthlyFeeFeature.getEffectiveMonthlyFee(
        studentGrade.gradeId,
        payment.schoolMonthId
      );
      const originalAmount = monthlyFee?.monthlyFee.amount ?? new Decimal(0);

      // Get discounts applied
      const discounts = await this.discountFeature.listStudentMonthDiscounts(
        studentId,
        payment.schoolMonthId
      );

      paymentHistory.push({
        paymentId: payment.id,
        amount: payment.amount,
        expectedAmount,
        originalAmount,
        discountAmount: originalAmount.minus(expectedAmount),
        discountsApplied: discounts.map((d) => ({
          name: d.discount.name,
          amount: d.discount.amount,
          isPercentage: d.discount.isPercentage,
        })),
        paymentMethod: payment.paymentMethod.name,
        verified: payment.verified,
        schoolYear: payment.schoolMonth.schoolPeriod.schoolYear.name,
        schoolMonth: payment.schoolMonth.name,
        grade: studentGrade.grade.name,
        createdAt: payment.createdAt,
        reference: payment.reference,
      });
    }

    return paymentHistory;
  }

  private addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    d.setUTCMonth(d.getUTCMonth() + months);
    return d;
  }

  public async isOverdue(date: Date = new Date()) {
    const dueDay = await this.settingsService.get(Settings.PAYMENT_DUE_DAY);
    const gracePeriodDays = await this.settingsService.get(
      Settings.DAYS_UNTIL_OVERDUE
    );

    return isOverdue(date, dueDay, gracePeriodDays);
  }
}
