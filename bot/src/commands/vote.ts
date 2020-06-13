import {Command, CommandoClient, CommandoMessage} from "discord.js-commando";

export default class VoteCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			name: 'vote',
			memberName: 'vote',
			group: 'Utility',
			description: 'Setup a vote',
			args: [
				{
					key: 'url',
					prompt: 'URL supplied must be a valid CTFTime event url. e.g. https://ctftime.org/event/872',
					type: 'string'
				}
			],
		});
	}

	run(message: CommandoMessage, { url }: { url: string }) {
		return message.say('sry wat ' + url);
	}
}
