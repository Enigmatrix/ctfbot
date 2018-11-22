import bot from './bot';
import { config } from './util';
import agenda from './agenda';
import {initConnection} from './data';
import "reflect-metadata";

//If you want config.json so that you can test the bot too, contact me.
(async () => {
    await initConnection();
    await agenda.start();
    bot.login(config("DISCORD_BOT_TOKEN"));
})()