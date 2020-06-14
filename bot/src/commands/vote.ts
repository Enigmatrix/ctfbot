import {Command, CommandoClient, CommandoMessage} from "discord.js-commando";
import {Message} from "discord.js";
import {Option, Vote} from "@/db/entities/vote";
import {ObjectID} from "typeorm";

// TODO check if the strings actually fit this format using some type checker? remeber seeing one from reddit
export interface VoteTemplate {
  title: string,
  description: string,
  options: Option[],
  deadline: string|undefined
}

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
		const userArea = await message.direct(
`\`\`\`yaml
title: Vote Title
description: >
  Multiline description about
  the vote
deadline: thursday next week
options:
  - tick: Yes, I agree!
  - hammer: Hammer option!
\`\`\``);
    return null;
	}
}
