import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import {
  AuditableEntities,
  AuditLogActions,
  Payment,
  PaymentTags,
  Settings,
} from "@prisma/client";
import createHttpError from "http-errors";
import {
  SearchArgs,
  SearchResult,
  searchWithPaginationAndCriteria,
} from "../lib/search";
import { MonthlyFeeFeature } from "./monthlyFee.feature";
import { ExtendedPrisma } from "../config/container";
import { AuditLogService } from "../services/auditLog.service";
import { DiscountFeature } from "./discount.feature";
import { SettingsService } from "../services/settings.service";
import { ReportsFeature } from "./reports.feature";
import { isOverdue } from "../lib/isOverdue";
import { Decimal } from "@prisma/client/runtime/library";

@injectable()
export class PaymentFeature {
  constructor(
    @inject(TYPES.Prisma) private readonly prisma: ExtendedPrisma,
    @inject(TYPES.MonthlyFeeFeature)
    private readonly monthlyFeeFeature: MonthlyFeeFeature,
    @inject(TYPES.DiscountFeature)
    private readonly discountFeature: DiscountFeature,
    @inject(TYPES.AuditLogService)
    private readonly auditLogService: AuditLogService,
    @inject(TYPES.SettingsService)
    private readonly settingsService: SettingsService,
    @inject(TYPES.ReportsFeature)
    private readonly reportsFeature: ReportsFeature
  ) {}

  public async create(
    studentId: number,
    schoolMonthId: number,
    isRefund: boolean,
    amount: number,
    paymentMethodId: number,
    reference: string | null,
    verified: boolean | null,
    paidAt: Date
  ) {
    if (amount <= 0) throw createHttpError(400, "Monto de pago inválido.");

    const schoolMonth = await this.prisma.schoolMonth.findUniqueOrThrow({
      where: {
        id: schoolMonthId,
        deletedAt: null,
      },
      select: {
        schoolPeriodId: true,
      },
    });

    const studentGrade = await this.prisma.studentGrade.findFirstOrThrow({
      where: {
        studentId: studentId,
        schoolPeriodId: schoolMonth.schoolPeriodId,
        deletedAt: null,
      },
      select: {
        gradeId: true,
      },
    });

    let paymentTags: PaymentTags[] = [];

    const monthlyFee = await this.monthlyFeeFeature.getEffectiveMonthlyFee(
      studentGrade.gradeId,
      schoolMonthId
    );

    if (!monthlyFee)
      throw createHttpError(
        500,
        "Mensualidad vigente no encontrada para el grado seleccionado en el mes seleccionado."
      );

    const studentDue = await this.reportsFeature.getStudentDue(
      schoolMonthId,
      studentId
    );

    if (isRefund) {
      paymentTags.push(PaymentTags.REFUND);
    } else {
      const dueDay = await this.settingsService.get(Settings.PAYMENT_DUE_DAY);
      const daysUntilOverdue = await this.settingsService.get(
        Settings.DAYS_UNTIL_OVERDUE
      );
      const paymentIsOverdue = isOverdue(paidAt, dueDay, daysUntilOverdue);
      
      const expectedAmount = await this.reportsFeature.getStudentTotalMonthlyFee(
        studentGrade.gradeId,
        studentId,
        schoolMonthId,
        paymentIsOverdue
      );

      const amountDecimal = new Decimal(amount);
      
      if (amountDecimal.equals(expectedAmount)) {
        paymentTags.push(PaymentTags.FULL);
      } else if (
        amountDecimal.greaterThan(expectedAmount) ||
        amountDecimal.greaterThan(studentDue.totalMonthlyFee)
      ) {
        paymentTags.push(PaymentTags.OVERPAYMENT);
      } else {
        paymentTags.push(PaymentTags.PARTIAL);
      }

      if (paymentIsOverdue) {
        paymentTags.push(PaymentTags.OVERDUE);
      }
    }

    const paymentMethod = await this.prisma.paymentMethod.findUniqueOrThrow({
      where: {
        id: paymentMethodId,
        deletedAt: null,
      },
    });

    let paymentDetails = { reference, verified };

    if (paymentMethod.requiresReferenceId && !reference)
      throw createHttpError(
        400,
        "Referencia de pago requerida por método de pago."
      );
    if (paymentMethod.requiresManualVerification && verified === null)
      throw createHttpError(
        400,
        "Pago verificado necesita ser marcado como verdadero o falso por el metodo de pago."
      );

    if (!paymentMethod.requiresReferenceId) paymentDetails.reference = null;
    if (!paymentMethod.requiresManualVerification)
      paymentDetails.verified = null;

    await this.discountFeature.applyStudentDiscountsToMonth(
      studentId,
      schoolMonthId
    );

    const payment = await this.prisma.payment.create({
      data: {
        studentId,
        schoolMonthId,
        paymentTags,
        amount,
        paymentMethodId,
        paidAt,
        reference: paymentDetails.reference,
        verified: paymentDetails.verified,
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.PAYMENT,
      AuditLogActions.CREATE,
      payment
    );

    return payment;
  }

  public async update(
    id: number,
    data: { reference?: string; verified?: boolean }
  ) {
    const payment = await this.prisma.payment.findUniqueOrThrow({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        paymentMethod: true,
      },
    });

    const { requiresManualVerification, requiresReferenceId } =
      payment?.paymentMethod;

    if (data.reference !== undefined && !requiresReferenceId)
      throw createHttpError(
        400,
        "El metodo de pago no necesita referencia de pago."
      );

    if (data.verified !== undefined && !requiresManualVerification)
      throw createHttpError(
        400,
        "El metodo de pago no necesita verificación manual."
      );

    const paymentWithSameReferenceCount = await this.prisma.payment.count({
      where: {
        id: {
          not: id,
        },
        reference: data?.reference,
      },
    });

    if (paymentWithSameReferenceCount > 0)
      throw createHttpError(
        400,
        "El codigo de referencia ya ha sido usado en otro pago."
      );

    const updatedPayment = await this.prisma.payment.update({
      where: {
        id,
        deletedAt: null,
      },
      data,
    });

    this.auditLogService.createLog(
      AuditableEntities.PAYMENT,
      AuditLogActions.UPDATE,
      data
    );

    return updatedPayment;
  }

  public async softDelete(id: number) {
    const payment = await this.prisma.payment.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.PAYMENT,
      AuditLogActions.SOFT_DELETE,
      { deletedAt: payment.deletedAt }
    );

    return payment;
  }

  public async hardDelete(id: number) {
    const payment = await this.prisma.payment.delete({
      where: {
        id,
        deletedAt: {
          not: null,
        },
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.PAYMENT,
      AuditLogActions.DELETE,
      {}
    );

    return payment;
  }

  public async findById(id: number, includeDeleted: boolean) {
    return await this.prisma.payment.findUnique({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  public async search(
    args: SearchArgs<
      Partial<Omit<Payment, "id" | "deletedAt" | "createdAt" | "updatedAt">> & {
        deletedAt?: {
          not: null;
        };
      }
    >
  ): Promise<SearchResult<Payment>> {
    return searchWithPaginationAndCriteria<Payment>(
      this.prisma.payment.findMany,
      this.prisma.payment.similarity,
      {
        ...args,
        where: { ...args.where },
      },
      await this.settingsService.get(Settings.SEARCH_THRESHOLD)
    );
  }
}
