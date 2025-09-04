import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { Payment, PaymentType, PrismaClient } from "@prisma/client";
import createHttpError from "http-errors";
import {
  SearchArgs,
  SearchResult,
  searchWithPaginationAndCriteria,
} from "../lib/search";
import { MonthlyFeeFeature } from "./monthlyFee.feature";

@injectable()
export class PaymentFeature {
  constructor(
    @inject(TYPES.Prisma) private readonly prisma: PrismaClient,
    @inject(TYPES.MonthlyFeeFeature)
    private readonly monthlyFeeFeature: MonthlyFeeFeature
  ) {}

  public async create(
    studentId: number,
    schoolPeriodId: number,
    paymentType: Exclude<PaymentType, "FULL" | "PARTIAL"> | null,
    amount: number,
    paymentMethodId: number,
    reference: string | null,
    verified: boolean | null
  ) {
    if (amount <= 0) throw createHttpError(400, "Monto de pago inválido.");

    const schoolPeriod = await this.prisma.schoolPeriod.findUniqueOrThrow({
      where: {
        id: schoolPeriodId,
        deletedAt: null,
      },
      select: {
        schoolYearId: true,
      },
    });

    const studentGrade = await this.prisma.studentGrade.findFirstOrThrow({
      where: {
        studentId: studentId,
        schoolYear: {
          id: schoolPeriod.schoolYearId,
        },
        deletedAt: null,
      },
      select: {
        gradeId: true,
      },
    });

    let pType: PaymentType | null = paymentType;

    const monthlyFee = await this.monthlyFeeFeature.getEffectiveMonthlyFee(
      studentGrade.gradeId,
      schoolPeriodId
    );

    if (!monthlyFee)
      throw createHttpError(
        500,
        "Mensualidad vigente no encontrada para el grado seleccionado en el periodo seleccionado."
      );

    if (pType === null) {
      if (amount >= monthlyFee?.monthlyFee.amount.toNumber()) {
        pType = PaymentType.FULL;
      } else {
        pType = PaymentType.PARTIAL;
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

    return await this.prisma.payment.create({
      data: {
        studentId,
        schoolPeriodId,
        paymentType: pType!,
        amount,
        paymentMethodId,
        reference: paymentDetails.reference,
        verified: paymentDetails.verified,
      },
    });
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

    return await this.prisma.payment.update({
      where: {
        id,
        deletedAt: null,
      },
      data,
    });
  }

  public async softDelete(id: number) {
    return await this.prisma.payment.update({
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
    return await this.prisma.payment.delete({
      where: {
        id,
        deletedAt: {
          not: null,
        },
      },
    });
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
    return searchWithPaginationAndCriteria(
      this.prisma.payment.findMany,
      this.prisma.payment.count,
      {
        ...args,
        where: { ...args.where },
      }
    );
  }
}
