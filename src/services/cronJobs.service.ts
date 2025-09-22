import { injectable } from "inversify";
import * as cron from "node-cron";
import logger from "../app/logger";

interface ICronJobsService {
  start(): Promise<void>;
  stop(): void;
  scheduleJob(
    cronExpression: string,
    jobName: string,
    jobFunction: () => Promise<void>
  ): void;
}

@injectable()
export abstract class CronJobsService implements ICronJobsService {
  private scheduledJobs: Map<string, cron.ScheduledTask> = new Map();

  public abstract start(): Promise<void>;

  stop(): void {
    logger.info("Stopping cron jobs...");
    this.scheduledJobs.forEach((job, name) => {
      job.destroy();
      logger.info(`Stopped cron job: ${name}`);
    });
    this.scheduledJobs.clear();
  }

  scheduleJob(
    cronExpression: string,
    jobName: string,
    jobFunction: () => Promise<void>
  ): void {
    try {
      const job = cron.schedule(cronExpression, async () => {
        try {
          logger.info(`Running cron job: ${jobName}`);
          await jobFunction();
          logger.info(`Completed cron job: ${jobName}`);
        } catch (error) {
          logger.error(`Error in cron job ${jobName}:`, error);
        }
      });

      this.scheduledJobs.set(jobName, job);
      logger.info(
        `Scheduled cron job: ${jobName} with expression: ${cronExpression}`
      );
    } catch (error) {
      logger.error(`Failed to schedule cron job ${jobName}:`, error);
    }
  }
}
