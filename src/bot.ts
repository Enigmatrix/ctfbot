import { Client } from 'discord.js';
import logger from './logger';
import commands from './commands/index';

const bot = new Client();
bot.on("ready", () => {
    logger.info('CTFBot Ready');
});

bot.on('message', msg => {
    if(msg.content[0] !== "!" || msg.author.id === bot.user.id) return;

    let [cmd, ...args] = msg.content.substr(1).split(' ');
    commands.run(cmd, { args, msg });
});

export default bot;