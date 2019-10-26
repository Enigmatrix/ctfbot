import { Channel, TextChannel } from "discord.js";
import * as CTFTime from "../services/ctftime";
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
    await ctx.flow()

      .step("Getting CTFTime event data", async () => {
        if (!ctftimeUrl || !isCTFTimeUrl(ctftimeUrl)) {
          await ctx.error(
            "URL supplied must be a valid CTFTime event url. " +
            "e.g. https://ctftime.org/event/872");
        }
        const ctftimeEvent = await CTFTime.eventFromUrl(ctftimeUrl);
        return { ctftimeEvent };
      })

      .step("Creating new channel", async ({ ctftimeEvent }) => {
        const ctfCatChannel = guild.channels.find(x => x.name === "CTFs");
        const newCtfChannel = await guild.createChannel(ctftimeEvent.title, "text") as TextChannel;
        await newCtfChannel.setParent(ctfCatChannel);
        newCtfChannel.setTopic("SEE :pushpin: FOR INFO");
        // TODO put embed here
      })

      .step("The rest", async () => ({}))
      .run("Checkout #new-channel");
  }
}
