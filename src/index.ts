import bot from './bot';
const tokenName = "DISCORD_BOT_TOKEN";
import commands, { Command } from './commands';

commands.register(new Command('ping',
        async args => {
            await args.msg.channel.send('pong'); })
        .description('Simple Ping reply')
        .usage("!ping"));

//If you want config.json so that you can test the bot too, contact me.
bot.login(process.env[tokenName] || require("../config.json")[tokenName]);