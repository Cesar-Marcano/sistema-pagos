import express from "express";
import logger from "./logger";
import { container } from "../config/container";
import { PassportConfig } from "../config/passport";
import passport from "passport";
import { errorHandler } from "../config/globalErrorHandler";
import { router } from "../routes";
import { setupSwagger } from "../config/swagger";
import { TYPES } from "../config/types";
import { JobsService } from "../services/jobs.service";
import { ExtendedPrisma } from "../config/container";

export async function run() {
  const app = express();

  const passportConfig = container.get<PassportConfig>(PassportConfig);

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  passportConfig.setup();

  app.use(passport.initialize());

  setupSwagger(app);

  // Routes
  app.use(router);

  // error handler
  app.use(errorHandler);

  // Start cron jobs
  const jobsService = container.get<JobsService>(TYPES.JobsService);
  await jobsService.start();

  const server = app.listen(3000, () => {
    logger.info("Server listening on port 3000");
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);

    try {
      // Stop cron jobs
      jobsService.stop();

      // Disconnect from database
      const prisma = container.get<ExtendedPrisma>(TYPES.Prisma);
      await prisma.$disconnect();
      logger.info("Database connection closed");

      // Close server
      server.close((err) => {
        if (err) {
          logger.error("Error during server shutdown:", err);
          process.exit(1);
        }
        logger.info("Server closed");
        process.exit(0);
      });
    } catch (error) {
      logger.error("Error during graceful shutdown:", error);
      process.exit(1);
    }

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

  return server;
}
