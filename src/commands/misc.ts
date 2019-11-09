import { Message, RichEmbed } from "discord.js";
import moment from "moment";
import agenda, { AGENDA_ECHO, REPEATED_NOTIFY_UPCOMING_CTF } from "../services/agenda";
import { formatNiceSGT } from "../utils";
import commands, { CmdCtx, Command, CommandGroup, Group } from "./definitions";

@Group("Miscellaneous/Utility")
export default class Misc extends CommandGroup {
  @Command({ desc: "Force upcoming events to show up" })
  public async upcoming(_: CmdCtx) {
    // await agenda.now(AGENDA_ECHO);
    await agenda.now(REPEATED_NOTIFY_UPCOMING_CTF);
  }

  @Command({ desc: "Kick a user. Ouchie" })
  public async kick(ctx: CmdCtx) {
    const user = ctx.msg.mentions.users.first();
    ctx.send(`:mans_shoe: <@${user.id}> => :skull_crossbones:`);
  }

  @Command({ desc: "Simple ping reply" })
  public async ping(ctx: CmdCtx) {
    await ctx.msg.channel.send("pong");
  }

  @Command({ desc: "Show status message" })
  public async status(ctx: CmdCtx) {
    const { channel } = ctx.msg;
    const uptime = process.uptime();
    const mem = process.memoryUsage().rss;

    const pingStart = Date.now();
    const msg = (await channel.send(
      new RichEmbed({ title: "Pinging...", color: 0xffeb3b })
    )) as Message;
    const pingEnd = Date.now();
    const jobs = await agenda.jobs({ nextRunAt: { $gte: new Date() } });

    const memoryInfo =
      `${Math.floor(mem / (1024 * 1024 * 1024))}gb ` +
      `${Math.floor((mem % (1024 * 1024 * 1024)) / (1024 * 1024))}mb ` +
      `${Math.floor((mem % (1024 * 1024)) / 1024)}kb ` +
      `${Math.floor(mem % 1024)}b `;

    await msg.edit(
      new RichEmbed({
        title: "Status",
        color: 0x00e676,
        description:
          `**Ping**: ${pingEnd - pingStart} ms\n` +
          `**Uptime**: ${moment.duration(uptime, "seconds").humanize()}\n` +
          `**Memory**: ${memoryInfo}\n` +
          `**Jobs**:\n` +
          jobs
            .map(x => `_${formatNiceSGT(x.attrs.nextRunAt)}_:\n${x.attrs.name}`)
            .join("\n\n")
      })
    );
  }

  @Command({
    desc: "Print help message",
    usage: "!help\n!help <cmd>"
  })
  public async help(ctx: CmdCtx) {
    if (ctx.args[0] === undefined) {
      ctx.msg.channel.send(
        new RichEmbed({
          title: ":question: Help",
          color: 0x00e676,
          fields: Array.from(commands.commandMap.entries()).map(
            ([key, cmd]) => {
              return {
                name: key,
                value: `**${cmd.usage}**\n${cmd.desc}`
              };
            }
          )
        })
      );
    } else if (commands.commandMap.has(ctx.args[0])) {
      const cmd = commands.commandMap.get(ctx.args[0]);
      if (!cmd) {
        return;
      }
      ctx.msg.channel.send(
        new RichEmbed({
          title: ":question: Help for " + ctx.args[0],
          color: 0x00e676,
          fields: [
            {
              name: ctx.args[0],
              value: `**${cmd.usage}**\n${cmd.desc}`
            }
          ]
        })
      );
    } else {
      ctx.msg.channel.send(
        new RichEmbed({
          title: ":question: Command not found",
          color: 0xff1744
        })
      );
    }
  }
}
