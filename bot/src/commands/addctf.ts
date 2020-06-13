import {Command, CommandoClient, CommandoMessage} from "discord.js-commando";
import {Message} from "discord.js";

export default class AddCtfCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			name: "addctf",
			memberName: "addctf",
			group: "ctf",
			description: "Add a new CTF",
			args: [
				{
					key: "url",
					prompt: "URL supplied must be a valid CTFTime event url. e.g. https://ctftime.org/event/872",
					type: "string"
				}
			],
		});
	}

	async run(message: CommandoMessage, { url }: { url: string }): Promise<Message|Message[]|null> {
		return message.say("sry wat " + url);
	}
}
