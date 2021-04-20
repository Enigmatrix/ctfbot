import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import ctftime from "@/services/ctftime";
import { CTF } from "@/data/entities/ctf";
import { ctfMainMessageEmbed } from "@/util/embed";
import config from "@/util/config";
import NotifyCTFReactors from "@/jobs/NotifyCTFReactors";
import { DateTime } from "luxon";
import NotifyCTFEnd from "@/jobs/NotifyCTFEnd";

export default class AddCTF extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "addctf",
      group: "ctf",
      memberName: "addctf",
      description: "Creates a channel to represent the CTF. Posts a message to keep track of when the CTF starts.",
      args: [{
        key: "url",
        prompt: "please provide the CTFTime URL",
        type: "string",
        error: "the CTFTime URL is invalid",
        validate: (url: string) => ctftime.isValidUrl(url)
      }]
    });
  }

  async run(message: CommandoMessage, args: {url: string}) {
    const event = await ctftime.eventForUrl(args.url);
    const channel = await message.guild.channels.create(event.title, {
      type: "text",
      topic: "SEE :pushpin: FOR INFO",
      parent: config.get("DISCORD_CTFS_CHANNEL"),
      reason: `Channel for ${event.title}`
    });

    const ctf = new CTF(event);

    const mainMessage = await channel.send(ctfMainMessageEmbed(ctf));
    ctf.discord = { channel: channel.id, mainMessage: mainMessage.id };

    await mainMessage.pin();
    await mainMessage.react("👌");
    
    await ctf.save();

    const time = DateTime.fromISO(ctf.info.start).minus({ hour: 1 }).toJSDate(); // 1 hour before start
    NotifyCTFReactors.schedule(time, { ctf_id: ctf.id });
    const end = DateTime.fromISO(ctf.info.finish).toJSDate();
    NotifyCTFEnd.schedule(end, { ctf_id: ctf.id });

    return message.say(`Done! Head over to ${channel} for more info.`);
  }
}