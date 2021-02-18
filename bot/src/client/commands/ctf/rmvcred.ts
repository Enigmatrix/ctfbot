import { fetchChannelMessage } from "@/client";
import { CTF } from "@/data/entities/ctf";
import { ctfMainMessageEmbed } from "@/util/embed";
import { Command, CommandoClient, CommandoMessage, FriendlyError } from "discord.js-commando";

export default class RmvCred extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "rmvcred",
      group: "ctf",
      memberName: "rmvcred",
      description: "Remove credentials from the main message of the CTF",
      argsSingleQuotes: true,
      args: [{
        key: "key",
        prompt: "please provide key",
        type: "string",
        error: "no key",
      }]
    });
  }

  async run(message: CommandoMessage, args: {key: string, value: string}) {
    const ctf = await CTF.findOne({ where: { "discord.channel": message.channel.id, archived: false } });
    if(!ctf) {
      throw new FriendlyError("This channel is not a valid CTF channel.");
    }
    delete ctf.credentials[args.key];
    await ctf.save();
    
    const [_, mainMessage] = await fetchChannelMessage(ctf.discord.channel, ctf.discord.mainMessage);
    await mainMessage.edit(ctfMainMessageEmbed(ctf));

    return null;
  }
}