import { User } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";

export default class Kick extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "kick",
      group: "misc",
      memberName: "kick",
      description: "Kick a user. Metaphysically =D",
      args: [{
        key: "target",
        prompt: "provide the target of my Altama boots",
        type: "user"
      }]
    });
  }

  async run(message: CommandoMessage, args: { target: User }) {
    return message.say(`:boot: ${args.target}`);
  }
}
