import { Message, RichEmbed, TextChannel } from "discord.js";
import moment from "moment";
import agenda, { NOTIFY_CTF_REACTORS } from "../agenda";
import bot from "../bot";
import { getCtftimeEvent, isCtfTimeUrl } from "../ctftime";
import { CTFTimeCTF } from "../entities/ctf";
import {trello, trelloEx } from "../trello";
import { expect, formatNiceSGT, ifNot } from "../util";
import { CmdRunArgs, Command, CommandGroup, Group } from "./commands";

@Group("CTF")
export class Ctf extends CommandGroup {

    public static NoCreds = "None. Use `!addcreds field1=value1 field2=value2` to add credentials";
    public static NotCtfChannel = "This command is only valid in a CTF channel";

    public static async getCtf(chan: TextChannel): Promise<CTFTimeCTF|undefined> {
        return await CTFTimeCTF.findOne({discordChannelId: chan.id, archived: false});
    }

    public static createCtfWriteupMessageEmbed(writeupName: string, writeupLink: string) {
        return new RichEmbed({
            color: 0x006dee,
            author: {
              name: `Writeup for ${writeupName}: ${writeupLink}`,
            },
        });
    }

    public static async isCtfChannel(chan: TextChannel): Promise<boolean> {
        return !!await this.getCtf(chan);
    }

    public static async getCtfMainMessageFromChannel(channel: TextChannel): Promise<undefined | Message> {

        const ctf = await this.getCtf(channel);
        if (!ctf) {
            channel.send(this.NotCtfChannel);
            return;
        }
        return await Ctf.getCtfMainMessageFromCtfAndChannel(ctf, channel);
    }

    public static async getCtfMainMessageFromCtf(ctf: CTFTimeCTF): Promise<undefined | Message> {
        return await this.getCtfMainMessageFromCtfAndChannel(ctf,
            bot.guilds.first().channels.get(ctf.discordChannelId) as TextChannel);
    }

    public static async getCtfMainMessageFromCtfAndChannel(ctf: CTFTimeCTF, channel: TextChannel) {
        return await channel.fetchMessage(ctf.discordMainMessageId);
    }

    public static createCtfMainMesssageEmbed(ctftimeEvent: CTFTimeCTF) {
        return new RichEmbed({
            color: 0x1e88e5,
            author: {
                name: `${ctftimeEvent.name} (${ctftimeEvent.format})`,
                icon_url: ctftimeEvent.logoUrl,
            },
            description: ctftimeEvent.description,
            fields: [
                { name: "URL", value: ctftimeEvent.url },
                { name: "Trello", value: ctftimeEvent.trelloUrl },
                // tslint:disable-next-line:max-line-length
                { name: "Timing", value: `${formatNiceSGT(ctftimeEvent.start)} - ${formatNiceSGT(ctftimeEvent.finish)}` },
                { name: "Credentials", value:
                    Object.keys(ctftimeEvent.credentials).length === 0 ? Ctf.NoCreds :
                        Object.entries(ctftimeEvent.credentials)
                            .map((x) => "```" + ` ${x[0]} : ${x[1]} ` + "```").join(""),
                }],
            url: ctftimeEvent.url,
            footer: {
                text: `Hosted by ${ctftimeEvent.hosts.join(", ")}. React with 👌 to get a DM 1hr before the CTF starts`,
            },
        });
    }

    constructor() {
        super();
    }

    @Command({
        desc: "Add a new ctf",
        usage: "!addctf <ctftime_url>",
    })
    public async addctf(args: CmdRunArgs) {
        const [ctftimeUrl] = args.checkedArgs(1);
        const {guild, channel} = args.msg;

        await ifNot(isCtfTimeUrl(ctftimeUrl),
            async () => args.printUsage());

        const ctftimeEvent = await getCtftimeEvent(ctftimeUrl);
        const ctfs = await expect(guild.channels.find((x) => x.name === "CTFs"),
            async () => await channel.send("CTFs category channel missing"));

        const newChannel = await guild.createChannel(ctftimeEvent.title, "text") as TextChannel;
        await newChannel.setParent(ctfs);
        newChannel.setTopic("SEE :pushpin: FOR INFO");

        const board = await trello.board.create({
            name: ctftimeEvent.title,
            desc: `CTF Trello Board for ${ctftimeEvent.title}`,
            idOrganization: "hatssg",
            prefs_permissionLevel: "org",
            prefs_comments: "members",
            prefs_invitations: "members",
        });

        const idBoard = board.id;
        // delete old labels
        for (const label of await trelloEx.board.getLabels(idBoard)) {
            await trello.label.del(label.id || "");
        }
        const labels: trelloEx.Label[] = [
            {name: "pwn", color: "orange", idBoard},
            {name: "re", color: "red", idBoard},
            {name: "misc", color: "sky", idBoard},
            {name: "web", color: "green", idBoard},
            {name: "stego", color: "yellow", idBoard},
            {name: "crypto", color: "purple", idBoard},
            {name: "forensic", color: "lime", idBoard}];
        // create new labels
        for (const label of labels) {
            await trello.label.create(label);
        }

        let ctf = new CTFTimeCTF(ctftimeEvent, board.shortUrl, newChannel.id);
        const mainMessage = await newChannel.send(Ctf.createCtfMainMesssageEmbed(ctf));

        const messages = mainMessage instanceof Message ? [mainMessage] : mainMessage;
        for (const message of messages) {
            await message.pin();
        }
        const lastMsg = messages[messages.length - 1];
        await lastMsg.react("👌");
        ctf.discordMainMessageId = lastMsg.id;

        ctf = await ctf.save();

        await agenda.schedule(
            moment(ctf.start).subtract(1, "hour").toDate(),
            NOTIFY_CTF_REACTORS, { ctf: ctf.id });
    }

    @Command({
        desc: "Add credentials to the pinned CTFBot message",
        usage: "!addcreds field1=val1 field2=val2...",
    })
    public async addcreds(args: CmdRunArgs) {
        const newCreds = args.rawArgs.map((x) => x.split("="))
            .filter((x) => x.length === 2)
            .filter((x) => x[0].indexOf("```") === -1 && x[1].indexOf("```") === -1);
        const channel = args.msg.channel as TextChannel;

        const ctf = await Ctf.getCtf(channel).expect(
            async () => await channel.send(Ctf.NotCtfChannel));

        for (const [key, val] of newCreds) {
            ctf.credentials[key] = val;
        }

        await ctf.save();

        const mainMessage = await Ctf.getCtfMainMessageFromCtfAndChannel(ctf, channel);
        await mainMessage.edit(Ctf.createCtfMainMesssageEmbed(ctf));
    }

    @Command({
        desc: "Remove credentials from the pinned CTFBot message",
        usage: "!rmvcreds field1 field2 ...",
    })
    public async rmvcreds(args: CmdRunArgs) {
        const channel = args.msg.channel as TextChannel;
        const ctf = await Ctf.getCtf(channel).expect(
            async () => await channel.send(Ctf.NotCtfChannel));

        for (const key of args.rawArgs) {
            delete ctf.credentials[key];
        }
        await ctf.save();

        const mainMessage = await Ctf.getCtfMainMessageFromCtfAndChannel(ctf, channel);
        await mainMessage.edit(Ctf.createCtfMainMesssageEmbed(ctf));
    }

    @Command({
        desc: "Archive a CTF",
    })
    public async archive(args: CmdRunArgs) {
        const channel = args.msg.channel as TextChannel;
        const ctf = await Ctf.getCtf(channel).expect(
            async () => await channel.send(Ctf.NotCtfChannel));

        const archive = await expect(args.msg.guild.channels.find((x) => x.name === "archives"),
            async () => channel.send("CTFs archive channel missing"));
        await channel.setParent(archive);

        ctf.archived = true;
        await ctf.save();
    }
}
