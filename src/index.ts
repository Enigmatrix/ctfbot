import bot from './bot';
import { config } from './util';
import agenda from './agenda';

//If you want config.json so that you can test the bot too, contact me.
(async () => {
    await agenda.start();
    bot.login(config("DISCORD_BOT_TOKEN"));
})()