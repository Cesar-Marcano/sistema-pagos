import { inject, injectable } from "inversify";
import { CronJobsService } from "./cronJobs.service";
import { TYPES } from "../config/types";
import { ExtendedPrisma } from "../config/container";
import { SettingsService } from "./settings.service";
import { PurgableModels, Settings } from "@prisma/client";
import { SchoolMonthFeature } from "../features/schoolMonth.feature";
import { SchoolPeriodFeature } from "../features/schoolPeriod.feature";
import { SchoolYearFeature } from "../features/schoolYear.feature";
import logger from "../app/logger";
import { StudentFeature } from "../features/student.feature";

@injectable()
export class JobsService extends CronJobsService {
  constructor(
    @inject(TYPES.Prisma) private prisma: ExtendedPrisma,
    @inject(TYPES.SettingsService) private settingsService: SettingsService,
    @inject(TYPES.SchoolMonthFeature)
    private schoolMonthFeature: SchoolMonthFeature,
    @inject(TYPES.SchoolPeriodFeature)
    private schoolPeriodFeature: SchoolPeriodFeature,
    @inject(TYPES.SchoolYearFeature)
    private schoolYearFeature: SchoolYearFeature,
    @inject(TYPES.StudentFeature)
    private studentFeature: StudentFeature
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

    const autoSetActualSchoolPeriodMonthAndYear =
      await this.settingsService.get(
        Settings.AUTO_SET_ACTUAL_SCHOOL_PERIOD_MONTH_AND_YEAR
      );

    const autoEnrollStudentsInNewPeriod = await this.settingsService.get(
      Settings.AUTO_ENROLL_STUDENTS_IN_NEW_PERIOD
    );

    const autoEnrollStudentsInNewPeriodDay = await this.settingsService.get(
      Settings.AUTO_ENROLL_PERIOD_CRON_DAY
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

    autoSetActualSchoolPeriodMonthAndYear &&
      this.scheduleJob(
        "0 0 1 * *",
        "Auto Set Actual School Period Month and Year",
        this.autoSetActualSchoolPeriodMonthAndYear.bind(this)
      );

    autoEnrollStudentsInNewPeriod &&
      this.scheduleJob(
        `0 0 ${autoEnrollStudentsInNewPeriodDay} * *`,
        "Auto Enroll Students In New Period",
        this.autoEnrollStudentsInNewPeriod.bind(this)
      );
  }

  private async auditLogCleanup(auditLogRetentionDays: number) {
    try {
      await this.prisma.auditLog.deleteMany({
        where: {
          createdAt: {
            lt: new Date(
              Date.now() - auditLogRetentionDays * 24 * 60 * 60 * 1000
            ),
          },
        },
      });
    } catch (err) {
      logger.error("Error al limpiar AuditLog", err);
    }
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

  private async autoSetActualSchoolPeriodMonthAndYear() {
    try {
      const actualSchoolPeriod =
        await this.schoolPeriodFeature.getActualPeriod();
      const actualSchoolYear =
        await this.schoolYearFeature.getActualSchoolYear();
      const actualSchoolMonth =
        await this.schoolMonthFeature.getActualSchoolMonth();

      if (!actualSchoolPeriod) {
        logger.warn("No se encontró un periodo escolar actual.");
        return;
      }

      if (!actualSchoolYear) {
        logger.warn("No se encontró un año escolar actual.");
        return;
      }

      if (!actualSchoolMonth) {
        logger.warn("No se encontró un mes escolar actual.");
        return;
      }

      await this.settingsService.set(
        Settings.ACTUAL_SCHOOL_PERIOD_ID,
        actualSchoolPeriod.id
      );
      await this.settingsService.set(
        Settings.ACTUAL_SCHOOL_MONTH_ID,
        actualSchoolMonth.id
      );
      await this.settingsService.set(
        Settings.ACTUAL_SCHOOL_YEAR_ID,
        actualSchoolYear.id
      );
    } catch (err) {
      logger.error(
        "Error al actualizar los valores de año/periodo/mes en configuración",
        err
      );
    }
  }

  private async autoEnrollStudentsInNewPeriod() {
    const actualSchoolPeriodId = await this.settingsService.get(
      Settings.ACTUAL_SCHOOL_PERIOD_ID
    );
    const actualSchoolMonthId = await this.settingsService.get(
      Settings.ACTUAL_SCHOOL_MONTH_ID
    );

    if (!actualSchoolPeriodId || !actualSchoolMonthId) {
      logger.warn("No se encontró un periodo escolar o mes escolar actual.");
      return;
    }

    const isLastMonthOfPeriod =
      await this.schoolPeriodFeature.isLastMonthOfPeriod(
        actualSchoolPeriodId,
        actualSchoolMonthId
      );

    if (!isLastMonthOfPeriod) {
      return;
    }

    const nextSchoolPeriod = await this.schoolPeriodFeature.getNextPeriod(
      actualSchoolPeriodId
    );

    if (!nextSchoolPeriod) {
      return;
    }

    await this.studentFeature.enrollActiveStudentsToNextPeriod(
      actualSchoolPeriodId,
      nextSchoolPeriod.id
    );
  }
}
