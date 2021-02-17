import { fetchChannelMessage } from "@/client";
import { CTFTimeCTF } from "@/data/entities/ctftimectf";
import { mainMessageEmbed } from "@/util/embed";
import { Command, CommandoClient, CommandoMessage, FriendlyError } from "discord.js-commando";

export default class AddCred extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "addcred",
      group: "ctf",
      memberName: "addcred",
      description: "Add credentials to the main message of the CTF",
      argsSingleQuotes: true,
      args: [{
        key: "key",
        prompt: "please provide key",
        type: "string",
        error: "no key",
      },
      {
        key: "value",
        prompt: "please provide value",
        type: "string",
        error: "no value",
      }]
    });
  }

  async run(message: CommandoMessage, args: {key: string, value: string}) {
    const ctf = await CTFTimeCTF.findOne({ where: { "discord.channel": message.channel.id, archived: false } });
    if(!ctf) {
      throw new FriendlyError("This channel is not a valid CTF channel.");
    }
    ctf.credentials[args.key] = args.value;
    await ctf.save();
    
    const [_, mainMessage] = await fetchChannelMessage(ctf.discord.channel, ctf.discord.mainMessage);
    await mainMessage.edit(mainMessageEmbed(ctf));

    return null;
  }
}