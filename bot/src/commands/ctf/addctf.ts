import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { MessageEmbed } from "discord.js";
import ctftime from "@/services/ctftime";
import { CTFTimeCTF } from "@/data/entities/ctftimectf";
import { formatSGT } from "@/util/format";
import { EMBED_INFO1 } from "@/util/embed";
import config from "@/util/config";

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

  mainMessageEmbed(ctf: CTFTimeCTF) {
    return new MessageEmbed({
      color: EMBED_INFO1,
      author: {
        name: `${ctf.info.title} (${ctf.info.format})`,
        icon_url: ctf.info.logo,
      },
      description: ctf.info.description,
      fields: [
        { name: "URL", value: ctf.info.url },
        //{ name: "Trello", value: ctftimeEvent.trelloUrl },
        { name: "Timing", value: `${formatSGT(ctf.info.start)} - ${formatSGT(ctf.info.finish)}` },
        { name: "Credentials", value:
          Object.keys(ctf.credentials).length === 0 ? "None. Use `!addcreds field1=value1 field2=value2` to add credentials" :
            Object.entries(ctf.credentials)
              .map(([key, value]) => "```" + ` ${key} : ${value} ` + "```").join(""),
        }],
      url: ctf.info.url,
      footer: {
        text: `Hosted by ${ctf.info.organizers.map(x => x.name).join(", ")}. React with 👌 to get a DM 1hr before the CTF starts`,
      },
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

    const ctf = new CTFTimeCTF(event);

    const mainMessage = await channel.send(this.mainMessageEmbed(ctf));
    ctf.discord = { channel: channel.id, mainMessage: mainMessage.id };

    await mainMessage.pin();
    await mainMessage.react("👌");
    
    await ctf.save();

    // TODO schedule job here

    return message.say(`Done! Head over to ${channel} for more info.`);
  }
}