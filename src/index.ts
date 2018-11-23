import bot from './bot';
import { config } from './util';
import agenda from './agenda';
import {initConnection} from './data';
import "reflect-metadata";
import webhooks from './webhooks';
import logger from './logger';

//If you want config.json so that you can test the bot too, contact me.
(async () => {
    await initConnection();
    await agenda.start();
    await bot.login(config("DISCORD_BOT_TOKEN"));
    await webhooks.listen((err, addr) => {
        if(err) {
            logger.error("Webhook Error", err);
            console.error(err);
            return;
        }
        logger.info('Webhooks listening on '+addr);
    });
})()