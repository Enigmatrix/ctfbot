import "reflect-metadata";

import { config } from "dotenv";
config({ path: "../.env" }); // place .env file containing environment variables in root project folder.

import { setupBot } from "@/bot";
import { initConnection } from "@/db";
import agenda from "@/services/agenda";
import logger from "@/util/logger";

(async () => {
  logger.info("Starting CTFBot...");
  await initConnection();
  logger.info("Starting Agenda Jobs management");
  await agenda.start();
  logger.info("Connected to database");
  await setupBot();
})();
