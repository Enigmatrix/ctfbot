import bot from "./bot";
import {config} from "./utils/";

(async () => {
  await bot.login(config("DISCORD_BOT_TOKEN"));
})();
