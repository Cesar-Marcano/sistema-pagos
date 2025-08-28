import express from "express";
import logger from "./logger";
import { container } from "../config/container";
import { PassportConfig } from "../config/passport";

export async function run() {
  const app = express();

  const passportConfig = container.get<PassportConfig>(PassportConfig);

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  passportConfig.setup();

  return app.listen(3000, () => {
    logger.info("Server listeining on port 3000");
  });
}
