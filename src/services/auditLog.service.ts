import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { ExtendedPrisma } from "../config/container";
import { AuditableEntities, AuditLogActions } from "@prisma/client";

@injectable()
export class AuditLogFeature {
  constructor(@inject(TYPES.Prisma) private readonly prisma: ExtendedPrisma) {}

  public async createLog(
    entity: AuditableEntities,
    action: AuditLogActions,
    changes: object,
    userId: number
  ): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        entity,
        action,
        changes: JSON.stringify(changes),
        userId,
      },
    });
  }
}
