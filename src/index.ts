import bot from './bot';
import { config } from './util';

//If you want config.json so that you can test the bot too, contact me.
bot.login(config("DISCORD_BOT_TOKEN"));