import bot from "./bot";
import { initConnection } from "./db";
import { setupServer } from "./server";
import { config } from "./utils/";

(async () => {
  await initConnection();
  await setupServer();
  await bot.login(config("DISCORD_BOT_TOKEN"));
})();
