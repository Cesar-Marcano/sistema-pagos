import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { PaymentMethod, PrismaClient } from "@prisma/client";

@injectable()
export class PaymentMethodFeature {
  constructor(@inject(TYPES.Prisma) private readonly prisma: PrismaClient) {}

  public async create(
    name: string,
    requiresManualVerification: boolean,
    requiresReferenceId: boolean
  ): Promise<PaymentMethod> {
    return await this.prisma.paymentMethod.create({
      data: {
        name,
        requiresManualVerification,
        requiresReferenceId,
      },
    });
  }
}
