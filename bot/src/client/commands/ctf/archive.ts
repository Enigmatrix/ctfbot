import { fetchChannelMessage, findChannel } from "@/client";
import { CTFTimeCTF } from "@/data/entities/ctftimectf";
import { CategoryChannel } from "discord.js";
import { Command, CommandoClient, CommandoMessage, FriendlyError } from "discord.js-commando";

export default class Archive extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "archive",
      group: "ctf",
      memberName: "archive",
      description: "Archive CTF channel",
    });
  }

    async run(message: CommandoMessage) {
        // TODO move all this common code into one file.
        const ctf = await CTFTimeCTF.findOne({ where: { "discord.channel": message.channel.id, archived: false } });
        if(!ctf) {
            throw new FriendlyError("This channel is not a valid CTF channel.");
        }
        
        const [channel, _] = await fetchChannelMessage(ctf.discord.channel, ctf.discord.mainMessage);
        const archive = await findChannel(chan => chan.name === `archives-${new Date().getFullYear()}`);
        if(!archive) {
            throw new Error(`Archive channel for year ${new Date().getFullYear()} not found`);
        }
        await channel.setParent(archive as CategoryChannel);

        ctf.archived = true;
        await ctf.save();

        return message.say("CTF Channel Archived!");
    }
}