import { inject, injectable } from "inversify";
import { CronJobsService } from "./cronJobs.service";
import { TYPES } from "../config/types";
import { ExtendedPrisma } from "../config/container";
import { SettingsService } from "./settings.service";
import { PurgableModels, Settings } from "@prisma/client";

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

    const dbCleanupDay = await this.settingsService.get(
      Settings.DB_CLEANUP_DAY
    );

    const softDeletedModelsToPurge = await this.settingsService.get(
      Settings.SOFT_DELETED_MODELS_TO_PURGE
    );

    this.scheduleJob(
      "0 0 * * *",
      "Audit Log Cleanup",
      this.auditLogCleanup.bind(this, auditLogRetentionDays)
    );

    softDeletedModelsToPurge.length > 0 &&
      this.scheduleJob(
        `0 0 ${dbCleanupDay} * *`,
        "Soft Deleted Models Cleanup",
        this.softDeletedModelsCleanup.bind(this, softDeletedModelsToPurge)
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

  private async softDeletedModelsCleanup(
    softDeletedModelsToPurge: PurgableModels[]
  ) {
    const modelMap: Record<PurgableModels, keyof typeof this.prisma> = {
      User: "user",
      SchoolYear: "schoolYear",
      SchoolPeriod: "schoolPeriod",
      Student: "student",
      MonthlyFee: "monthlyFee",
      MonthlyFeeOnGrade: "monthlyFeeOnGrade",
      Grade: "grade",
      StudentGrade: "studentGrade",
      Discount: "discount",
      StudentDiscount: "studentDiscount",
      PaymentMethod: "paymentMethod",
      Payment: "payment",
      StudentMonthDiscount: "studentMonthDiscount",
    };

    await this.prisma.$transaction(
      softDeletedModelsToPurge.map((model) =>
        (this.prisma[modelMap[model]] as any).deleteMany({
          where: { deletedAt: { not: null } },
        })
      )
    );
  }
}
