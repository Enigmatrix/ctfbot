import { Client } from "discord.js";
import commands from "./commands/index";
import logger from "./logger";
import {isInInterestLabChannel, isUrl} from './util';
const splitargs = require("splitargs");

const bot = new Client();
bot.on("ready", () => {
    logger.info("CTFBot Ready");
});

function splitter(str: string): string[] {
    return splitargs(str) as string[];
}

bot.on("message", (msg) => {
    // reminder if people post links in interest lab channel without the !res command
    if (isUrl(msg.content) && isInInterestLabChannel(msg)) {
        const res = commands.commandMap.get("res");
        if (!res) { return; }
        msg.reply(`please use \`!res\` (${res.usage}) to enable tracking.`);
        return;
    }

    if (msg.content[0] !== "!" || msg.author.id === bot.user.id) { return; }

    const [cmd, ...args] = splitter(msg.content.substr(1));
    commands.run(cmd, { args, msg });
});

export default bot;
