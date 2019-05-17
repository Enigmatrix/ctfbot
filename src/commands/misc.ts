import { Message, RichEmbed, TextChannel } from "discord.js";
import moment from "moment";
import agenda, { NOTIFY_CTF_REACTORS, REPEATED_NOTIFY_UPCOMING_CTF, NOTIFY_CTF_WRITEUPS } from "../agenda";
import { trello, trelloEx } from "../trello";
import { formatNiceSGT, ifNot } from "../util";
import commands, { CmdRunArgs, Command, CommandGroup, Group } from "./commands";
import { Ctf } from "./ctf";

@Group("Miscellaneous")
class Misc extends CommandGroup {

    @Command({})
    public async test(args: CmdRunArgs) {
        await agenda.now(NOTIFY_CTF_WRITEUPS, { ctf: "5cd43d17f04af80017714968" });
    }

    /*@Command({})
    async notif(args: CmdRunArgs){
        let channel = args.msg.channel as TextChannel;

        let ctf = await Ctf.getCtf(channel).expect(
            async () => await channel.send(Ctf.NotCtfChannel));
        await agenda.now(NOTIFY_CTF_REACTORS, {ctf: ctf.id})
    }*/

    @Command({
        desc: "Simple ping reply",
    })
    public async ping(args: CmdRunArgs) {
        await args.msg.channel.send("pong");
    }

    @Command({
        desc: "Show status message",
    })
    public async status(args: CmdRunArgs) {
        const {channel} = args.msg;
        const uptime = process.uptime();
        const mem = process.memoryUsage().rss;

        const pingStart = Date.now();
        const msg = await channel.send(new RichEmbed({title: "Pinging...", color: 0xffeb3b})) as Message;
        const pingEnd = Date.now();
        const jobs = await agenda.jobs({nextRunAt: {$gte: new Date()}});

        const memoryInfo =
            `${Math.floor(mem / (1024 * 1024 * 1024))}gb ` +
            `${Math.floor((mem % (1024 * 1024 * 1024)) / (1024 * 1024))}mb ` +
            `${Math.floor((mem % (1024 * 1024) / 1024))}kb ` +
            `${Math.floor(mem % 1024)}b `;

        msg.edit(new RichEmbed({
            title: "Status",
            color: 0x00e676,
            description:
                `**Ping**: ${(pingEnd - pingStart)} ms\n` +
                `**Uptime**: ${moment.duration(uptime, "seconds").humanize()}\n` +
                `**Memory**: ${memoryInfo}\n` +
                `**Jobs**:\n` + jobs.map((x) =>
                    `_${formatNiceSGT(x.attrs.nextRunAt)}_:\n${x.attrs.name}`).join("\n\n"),
        }));
    }

    @Command({
        desc: "Print help message",
        usage: "!help\n!help <cmd>",
    })
    public async help(args: CmdRunArgs) {
        if (args.rawArgs[0] === undefined) {
            args.msg.channel.send(new RichEmbed({
                title: ":question: Help",
                color: 0x00e676,
                fields: Array.from(commands.commandMap.entries())
                    .map(([key, cmd]) => { return {
                        name: key,
                        value: `**${cmd.usage}**\n${cmd.description}`,
                    }; }),
            }));
        } else if (commands.commandMap.has(args.rawArgs[0])) {
            const cmd = commands.commandMap.get(args.rawArgs[0]);
            if (!cmd) {return; }
            args.msg.channel.send(new RichEmbed({
                title: ":question: Help for " + args.rawArgs[0],
                color: 0x00e676,
                fields: [{
                    name: args.rawArgs[0],
                    value: `**${cmd.usage}**\n${cmd.description}`,
                }],
            }));
        } else {
            args.msg.channel.send(new RichEmbed({
                title: ":question: Command not found",
                color: 0xff1744,
            }));
        }
    }
}
