import { inject, injectable } from "inversify";
import { CronJobsService } from "./cronJobs.service";
import { TYPES } from "../config/types";
import { ExtendedPrisma } from "../config/container";
import { SettingsService } from "./settings.service";
import { Settings } from "@prisma/client";

@injectable()
export class JobsService extends CronJobsService {
  constructor(
    @inject(TYPES.Prisma) private prisma: ExtendedPrisma,
    @inject(TYPES.SettingsService) private settingsService: SettingsService
  ) {
    super();
  }

  public async start(): Promise<void> {
    const auditLogRetentionDays = await this.settingsService.get(
      Settings.AUDIT_LOG_RETENTION_DAYS
    );

    this.scheduleJob(
      "0 0 * * *",
      "Audit Log Cleanup",
      this.auditLogCleanup.bind(this, auditLogRetentionDays)
    );
  }

  private async auditLogCleanup(auditLogRetentionDays: number) {
    await this.prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: new Date(
            Date.now() - auditLogRetentionDays * 24 * 60 * 60 * 1000
          ),
        },
      },
    });
  }
}
