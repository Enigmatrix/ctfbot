import "reflect-metadata";

import { setupBot } from "@/bot";
import { initConnection } from "@/db";

(async () => {
  await initConnection();
  await setupBot();
})();
