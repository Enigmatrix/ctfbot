import { CommandoClient } from "discord.js-commando";
import { config } from "./util";
import path from "path";

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
		console.log("Not logged in?");
		return;
	}
	console.log(`Logged in as ${bot.user.tag}! (${bot.user.id})`);
	bot.user.setActivity("with Commando");
});

bot.on("error", console.error);

export async function setupBot(): Promise<void> {
  await bot.login(config("DISCORD_BOT_TOKEN"));
}

export default bot;
