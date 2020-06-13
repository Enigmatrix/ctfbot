import {Command, CommandoClient, CommandoMessage} from "discord.js-commando";
import {Message} from "discord.js";

export default class VoteCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			name: "vote",
			memberName: "vote",
			group: "misc",
			description: "Setup a vote",
		});
	}

	async run(message: CommandoMessage): Promise<Message|Message[]|null> {
		return await message.direct(
			`\`\`\`json
			{
				id
			}
			\`\`\``);
	}
}
