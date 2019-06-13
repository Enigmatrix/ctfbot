import { Client } from "discord.js";
import commands from "./commands/index";
import logger from "./logger";
const splitargs = require("splitargs");

const bot = new Client();
bot.on("ready", () => {
    logger.info("CTFBot Ready");
});

function splitter(str: string): string[] {
    return splitargs(str) as string[];
}

function eq(i: number, all: string, sub: string) {
    if (i < 0 || i >= all.length || i + sub.length >= all.length) {
        return false;
    }
    return all.substr(i, sub.length) === sub;
}

bot.on("message", (msg) => {
    if (msg.content[0] !== "!" || msg.author.id === bot.user.id) { return; }

    const [cmd, ...args] = splitter(msg.content.substr(1));
    commands.run(cmd, { args, msg });
});

export default bot;
