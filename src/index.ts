import bot from './bot';
const tokenName = "DISCORD_BOT_TOKEN";

//If you want config.json so that you can test the bot too, contact me.
bot.login(process.env[tokenName] || require("../config.json")[tokenName]);

