import "reflect-metadata";

import { config } from "dotenv";
config({ path: "../.env" }); // place .env file containing environment variables in root project folder.

import { setupBot } from "@/bot";
import { initConnection } from "@/db";

(async () => {
  await initConnection();
  await setupBot();
})();
