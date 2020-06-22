import {Command, CommandoClient, CommandoMessage} from "discord.js-commando";
import {Message, MessageEmbed} from "discord.js";
import {isCTFTimeUrl, ctftimeEventFromUrl, Event} from "@/services/ctftime";
import {Board, Label, Color} from "@/services/trello";
import {CTFTimeCTF} from "@/db/entities/ctf";
import {humanTimeSGT} from "@/util";

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
					type: "string",
          validate: isCTFTimeUrl
				}
			],
		});
	}

  ctfChannelMainEmbed(ctftimeEvent: CTFTimeCTF): MessageEmbed {
    return new MessageEmbed({
      color: 0x1e88e5, // TODO don't hardcode
      author: {
        name: `${ctftimeEvent.name} (${ctftimeEvent.format})`,
        icon_url: ctftimeEvent.logoUrl
      },
      description: ctftimeEvent.description,
      fields: [
        { name: "URL", value: ctftimeEvent.url },
        { name: "Trello", value: ctftimeEvent.trelloUrl },
        {
          name: "Timing",
          value:
            humanTimeSGT(ctftimeEvent.start) +
            " - " +
            humanTimeSGT(ctftimeEvent.finish)
        },
        {
          name: "Credentials",
          value:
            Object.keys(ctftimeEvent.credentials).length === 0
              ? "None. Use `!addcreds field1=value1 field2=value2` to add credentials"
              : Object.entries(ctftimeEvent.credentials)
                  .map(([k, v]) => "```" + ` ${k} : ${v} ` + "```")
                  .join("")
        }
      ],
      url: ctftimeEvent.url,
      footer: {
        text: `Hosted by ${ctftimeEvent.hosts.join(
          ", "
        )}. React with the 👌 emoji to get a DM 1hr before the CTF starts`
      }
    });
  }


  async createTrelloBoard(ctftimeEvent: Event): Promise<Board> {
    const board = await Board.create({
      name: ctftimeEvent.title,
      desc: `CTF Trello Board for ${ctftimeEvent.title}`,
      idOrganization: "hatssg", // TODO don't hardcode
      prefs_permissionLevel: "org",
      prefs_comments: "members",
      prefs_invitations: "members"
    });

    for (const label of await Label.getAll(board.id)) {
      if(!label.id) continue;
      await Label.delete(label.id);
    }
    const labels: Label[] = [
      { name: "pwn", color: Color.Orange },
      { name: "re", color: Color.Red },
      { name: "misc", color: Color.Sky },
      { name: "web", color: Color.Green },
      { name: "stego", color: Color.Yellow },
      { name: "crypto", color: Color.Purple },
      { name: "forensic", color: Color.Lime }
    ];
    for (const label of labels) {
      await Label.create(board.id, label);
    }

    return board;
  }

	async run({ guild, say }: CommandoMessage, { url }: { url: string }): Promise<Message|Message[]|null> {
    const ctftimeEvent = await ctftimeEventFromUrl(url);
    const ctfChannel = await guild.channels.create(ctftimeEvent.title, {
      type: "text",
      topic: "SEE :pushpin: FOR INFO",
      parent: "CTFs" // TODO don't hardcode
    });
    const trelloBoard = await this.createTrelloBoard(ctftimeEvent);

    const ctf = new CTFTimeCTF(
      ctftimeEvent,
      trelloBoard.shortUrl,
      ctfChannel.id
    );

    const infoMessage = await ctfChannel.send(this.ctfChannelMainEmbed(ctf));
    await infoMessage.pin();
    await infoMessage.react("👌");
    ctf.discordMainMessageId = infoMessage.id;

    await ctf.save();

    /* await agenda.schedule(
     *   moment(ctf.start)
     *     .subtract(1, "hour")
     *     .toDate(),
     *   NOTIFY_CTF_REACTORS,
     *   { ctf: ctf.id }
     * ); */
    
		return say("sry wat " + url);
	}
}
