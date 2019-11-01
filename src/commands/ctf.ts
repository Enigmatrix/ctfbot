import { Message, TextChannel } from "discord.js";
import { CTFTimeCTF } from "../db/entities/ctf";
import { ctfMainEmbed } from "../services/ctf";
import * as CTFTime from "../services/ctftime";
import { Board, Color, Label } from "../services/trello";
import { isCTFTimeUrl } from "../utils";
import { CmdCtx, Command, CommandGroup, Group } from "./definitions";

@Group("CTF")
export default class CTF extends CommandGroup {
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
          ctx.error(
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
        const board = await Board.create({
          name: ctftimeEvent.title,
          desc: `CTF Trello Board for ${ctftimeEvent.title}`,
          idOrganization: "hatssg",
          prefs_permissionLevel: "org",
          prefs_comments: "members",
          prefs_invitations: "members"
        });

        for (const label of await Label.getAll(board.id)) {
          if (!label.id) {
            return;
          }
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
          const infoMessage = await ctfChannel.sendEmbed(ctfMainEmbed(ctf));

          await infoMessage.pin();
          await infoMessage.react("👌");
          ctf.discordMainMessageId = infoMessage.id;
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
