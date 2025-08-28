import express from "express";
import logger from "./logger";
import { container } from "../config/container";
import { PassportConfig } from "../config/passport";
import passport from "passport";
import { errorHandler } from "../config/globalErrorHandler";
import { router } from "../routes";

export async function run() {
  const app = express();

  const passportConfig = container.get<PassportConfig>(PassportConfig);

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  passportConfig.setup();

  app.use(passport.initialize());

  // Routes

  app.use(router);

  // error handler
  app.use(errorHandler);

  return app.listen(3000, () => {
    logger.info("Server listeining on port 3000");
  });
}
