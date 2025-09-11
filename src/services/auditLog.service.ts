import { injectable, inject } from "inversify";
import { TYPES } from "../config/types";
import { AuditableEntities, AuditLogActions, Settings } from "@prisma/client";
import { ExtendedPrisma } from "../config/container";
import { asyncLocalStorage } from "../config/asyncLocalStorage";
import logger from "../app/logger";

export interface IAuditLogService {
  createLog(
    entity: AuditableEntities,
    action: AuditLogActions,
    changes: object
  ): Promise<void>;
}

@injectable()
export class AuditLogService implements IAuditLogService {
  constructor(@inject(TYPES.Prisma) private readonly prisma: ExtendedPrisma) {}

  public async createLog(
    entity: AuditableEntities,
    action: AuditLogActions,
    changes: object,
    overrideUserId?: number
  ): Promise<void> {
    const store = asyncLocalStorage.getStore();
    const userId = store?.get("userId") ?? overrideUserId;

    if (!userId) {
      logger.error(
        "User ID not found in async context. Cannot create audit log."
      );
      return;
    }

    try {
      await this.prisma.auditLog.create({
        data: {
          entity,
          action,
          changes: JSON.stringify(changes),
          userId,
        },
      });
    } catch (error) {
      logger.error("Error creating audit log:", error);
    }
  }
}
