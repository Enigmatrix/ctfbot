import bot from "./bot";
import {initConnection} from './db';
import {config} from "./utils/";


(async () => {
  await initConnection();
  await bot.login(config("DISCORD_BOT_TOKEN"));
})();
