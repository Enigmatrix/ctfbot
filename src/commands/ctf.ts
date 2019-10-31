import { Message, RichEmbed, TextChannel } from "discord.js";
import { CTFTimeCTF } from "../db/entities/ctf";
import * as CTFTime from "../services/ctftime";
import {
  Color,
  createBoard,
  createBoardLabel,
  deleteLabel,
  getLabels,
  Label
} from "../services/trello";
import { formatNiceSGT, isCTFTimeUrl } from "../utils";
import { CmdCtx, Command, CommandGroup, Group } from "./definitions";

@Group("CTF")
export default class CTF extends CommandGroup {
  public static ctfMainMesssageEmbed(ctftimeEvent: CTFTimeCTF) {
    return new RichEmbed({
      color: 0x1e88e5,
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
            formatNiceSGT(ctftimeEvent.start) +
            " - " +
            formatNiceSGT(ctftimeEvent.finish)
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

  @Command({
    desc: "Add a new ctf",
    usage: "!addctf <ctftime_url>"
  })
  public async addctf(ctx: CmdCtx) {
    const ctftimeUrl = ctx.args[0];
    const { guild } = ctx.msg;

    await ctx
      .flow()

      .step("Getting CTFTime event data", async () => {
        if (!ctftimeUrl || !isCTFTimeUrl(ctftimeUrl)) {
          await ctx.error(
            "URL supplied must be a valid CTFTime event url. " +
              "e.g. https://ctftime.org/event/872"
          );
        }
        const ctftimeEvent = await CTFTime.eventFromUrl(ctftimeUrl);
        return { ctftimeEvent };
      })

      .step("Creating new channel", async ({ ctftimeEvent }) => {
        const ctfCatChannel = guild.channels.find(x => x.name === "CTFs");
        const ctfChannel = (await guild.createChannel(
          ctftimeEvent.title,
          "text"
        )) as TextChannel;
        await ctfChannel.setParent(ctfCatChannel);
        ctfChannel.setTopic("SEE :pushpin: FOR INFO");
        return { ctfChannel };
      })

      .step("Creating Trello board", async ({ ctftimeEvent }) => {
        const board = await createBoard({
          name: ctftimeEvent.title,
          desc: `CTF Trello Board for ${ctftimeEvent.title}`,
          idOrganization: "hatssg",
          prefs_permissionLevel: "org",
          prefs_comments: "members",
          prefs_invitations: "members"
        });

        for (const label of await getLabels(board.id)) {
          if (!label.id) {
            return;
          }
          await deleteLabel(label.id);
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
          await createBoardLabel(board.id, label);
        }

        return { trelloBoard: board };
      })

      .step(
        "Sending pinned CTF information",
        async ({ ctftimeEvent, trelloBoard, ctfChannel }) => {
          const ctf = new CTFTimeCTF(
            ctftimeEvent,
            trelloBoard.shortUrl,
            ctfChannel.id
          );
          const mainMessage = await ctfChannel.send(
            CTF.ctfMainMesssageEmbed(ctf)
          );

          // TODO extract this out
          const messages =
            mainMessage instanceof Message ? [mainMessage] : mainMessage;
          for (const message of messages) {
            await message.pin();
          }
          const lastMsg = messages[messages.length - 1];
          await lastMsg.react("👌");
          ctf.discordMainMessageId = lastMsg.id;
          return { ctf };
        }
      )

      .step("Saving CTF event to db", async ({ ctf }) => {
        await ctf.save();
      })

      .step("Scheduling pre-CTF notification", async ({ ctf }) => {
        // TODO
        /*
          await agenda.schedule(
            moment(ctf.start).subtract(1, "hour").toDate(),
            NOTIFY_CTF_REACTORS, { ctf: ctf.id });
         */
      })

      .run(
        async ({ ctfChannel }) => `Checkout ${ctfChannel} for more information!`
      );
  }
}
