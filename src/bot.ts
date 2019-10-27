import { Client } from "discord.js";
import splitargs from "splitargs2";
import commands from "./commands";
import log from "./utils/logger";

const bot = new Client();
bot.on("ready", () => {
  log.info("bot client up!");
});

bot.on("message", async msg => {
  if (msg.content[0] !== "!" || msg.author.id === bot.user.id) {
    return;
  }

  const [cmd, ...args] = splitargs(msg.content.substr(1));
  await commands.run(cmd, { args, msg });
});

export default bot;
