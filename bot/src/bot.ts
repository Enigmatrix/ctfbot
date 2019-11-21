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

  if (msg.content[0] === "!") {
    const [cmd, ...args] = splitargs(msg.content.substr(1));
    await commands.run(cmd, { args, msg });
  } else if (hasResourceLink(msg)) {
    try {
      await createResource(msg);
    } catch (err) {
      log.error("Error in Resource creation", err);
    }
  }
});

bot.on("messageReactionAdd", async (reaction, newUser) => {
  try {
    await resourceAuthorReaction(reaction, newUser);
  } catch (err) {
    log.error("Error in Resource author reaction", err);
  }
});

export default bot;
