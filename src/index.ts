import "reflect-metadata";
import agenda from "./agenda";
import bot from "./bot";
import {initConnection} from "./data";
import { config } from "./util";

// If you want config.json so that you can test the bot too, contact me.
(async () => {
    await initConnection();
    await agenda.start();
    await bot.login(config("DISCORD_BOT_TOKEN"));
})();
