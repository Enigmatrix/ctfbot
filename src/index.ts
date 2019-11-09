import bot from "./bot";
import { initConnection } from "./db";
import { setupServer } from "./server";
import agenda from "./services/agenda";
import { config } from "./utils/";

(async () => {
  await initConnection();
  await setupServer();
  await agenda.start();
  await bot.login(config("DISCORD_BOT_TOKEN"));
})();
