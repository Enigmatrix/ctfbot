import { Client } from 'discord.js';
import logger from './logger';

const bot = new Client();
bot.on("ready", () => {
    logger.info('CTFBot Ready');
});

export default bot;