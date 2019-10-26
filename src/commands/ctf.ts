import { TextChannel } from "discord.js";
import * as CTFTime from "../services/ctftime";
import {
  Color,
  createBoard,
  createBoardLabel,
  deleteLabel,
  getLabels,
  Label
} from "../services/trello";
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
        async ({ ctftimeEvent, trelloBoard }) => {}
      )

      .step("Saving CTF event to db", async ({}) => {})

      .step("Scheduling pre-CTF notification", async ({}) => {})

      .run(async ({ ctfChannel }) => `Checkout ${ctfChannel} for information!`);
  }
}
