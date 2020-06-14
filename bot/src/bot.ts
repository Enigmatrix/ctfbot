import { CommandoClient } from "discord.js-commando";
import { config } from "./util";
import path from "path";
import logger from "./util/logger";

const bot = new CommandoClient({
  commandPrefix: "!",
  owner: config("OWNER"),
});

bot.registry
	.registerDefaultTypes()
	.registerGroups([
		["ctf", "CTF Management Commands"],
		["challenge", "CTF Challenge Management Commands"],
		["misc", "Miscellaneous Commands"],
	])
	.registerDefaultGroups()
	.registerDefaultCommands()
	.registerCommandsIn(path.join(__dirname, "commands"));

bot.once("ready", () => {
	if (!bot.user) {
    logger.crit("Login Failure");
		return;
	}
	logger.info(`CTFBot logged in as ${bot.user.tag}! (${bot.user.id})`);
});

bot.on("error", e => {
  logger.error(e);
});

export async function setupBot(): Promise<void> {
  await bot.login(config("DISCORD_BOT_TOKEN"));
}

export default bot;
