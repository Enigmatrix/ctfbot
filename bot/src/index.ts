import { CommandoClient } from 'discord.js-commando';
import { config } from "./util";
import path from 'path';

const client = new CommandoClient({
  commandPrefix: '!',
  owner: config("OWNER"),
});

client.registry
	.registerDefaultTypes()
	.registerGroups([
		['ctf', 'CTF Management Commands'],
		['challenge', 'CTF Challenge Management Commands'],
	])
	.registerDefaultGroups()
	.registerDefaultCommands()
	.registerCommandsIn(path.join(__dirname, 'commands'));

client.once('ready', () => {
	if (!client.user) {
		console.log(`Not logged in?`);
		return
	}
	console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
	client.user.setActivity('with Commando');
});

client.on('error', console.error);

client.login(config("DISCORD_BOT_TOKEN"));
