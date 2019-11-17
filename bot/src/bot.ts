import { Client } from "discord.js";
import splitargs from "splitargs2";
import commands from "./commands";
import {
  createResource,
  hasResourceLink,
  resourceAuthorReaction
} from "./services/resources";
import log from "./utils/logger";

const bot = new Client();
bot.on("ready", () => {
  log.info("bot client up!");
});

bot.on("message", async msg => {
  if (msg.author.id === bot.user.id) {
    return;
  }

  if (hasResourceLink(msg)) {
    await createResource(msg);
  } else if (msg.content[0] === "!") {
    const [cmd, ...args] = splitargs(msg.content.substr(1));
    await commands.run(cmd, { args, msg });
  }
});

bot.on("messageReactionAdd", async (reaction, newUser) => {
  await resourceAuthorReaction(reaction, newUser);
});

export default bot;
