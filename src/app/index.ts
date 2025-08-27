import express from "express";
import logger from "./logger";

export async function run() {
  const app = express();

  return app.listen(3000, () => {
    logger.info("Server listeining on port 3000");
  });
}
