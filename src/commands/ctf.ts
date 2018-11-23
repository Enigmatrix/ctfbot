import { Command, CmdRunArgs, CommandGroup, Group } from './commands';
import {trello, trelloEx } from '../trello';
import { TextChannel, RichEmbed, Message, } from 'discord.js';
import { isCtfTimeUrl, getCtftimeEvent } from '../ctftime';
import { formatNiceSGT, cloneEmbed } from '../util';
import agenda, { NOTIFY_CTF_REACTORS } from '../agenda';
import moment from 'moment';
import { CTFTimeCTF, Challenge } from '../entities/ctf';
import bot from '../bot';

@Group('CTF')
export class Ctf extends CommandGroup {

    constructor(){
        super();
    }

    @Command({
        desc: 'Add a new ctf',
        usage: '!addctf <ctftime_url>'
    })
    async addctf(args: CmdRunArgs){
        let ctftimeUrl = args.args[0];
        let {guild, channel} = args.msg;
        if(!ctftimeUrl || !isCtfTimeUrl(ctftimeUrl)){
            await channel.send('Usage: '+args.cmd.usage);
            return;
        }
        let ctftimeEvent = await getCtftimeEvent(ctftimeUrl);
        let ctfs = guild.channels.find(x => x.name === "CTFs");
        if(!ctfs){
            await channel.send('CTFs category channel missing');
            return;
        }
        let newChannel = await guild.createChannel(ctftimeEvent.title, "text") as TextChannel;
        await newChannel.setParent(ctfs);
        newChannel.setTopic('SEE :pushpin: FOR INFO');
    
        let board = await trello.board.create({
            name: ctftimeEvent.title,
            desc: `CTF Trello Board for ${ctftimeEvent.title}`,
            idOrganization: 'hatssg',
            prefs_permissionLevel: 'org',
            prefs_comments: 'members',
            prefs_invitations: 'members',
        });

        let idBoard = board.id;
        //delete old labels
        for(let label of await trelloEx.board.getLabels(idBoard)){
            await trello.label.del(label.id || "");
        }
        let labels : trelloEx.Label[] = [
            {name: 'pwn', color: 'orange', idBoard},
            {name: 're', color: 'red', idBoard},
            {name: 'misc', color: 'sky', idBoard},
            {name: 'web', color: 'green', idBoard},
            {name: 'stego', color: 'yellow', idBoard},
            {name: 'crypto', color: 'purple', idBoard},
            {name: 'forensic', color: 'lime', idBoard}];
            //create new labels
        for(let label of labels)
            await trello.label.create(label);
    
        let ctf = new CTFTimeCTF(ctftimeEvent, board.shortUrl, newChannel.id);
        let mainMessage = await newChannel.send(Ctf.createCtfMainMesssageEmbed(ctf));

        let messages = mainMessage instanceof Message ? [mainMessage] : mainMessage;
        for(let message of messages){
            await message.pin();
        }
        let lastMsg = messages[messages.length-1];
        await lastMsg.react('👌');
        ctf.discordMainMessageId = lastMsg.id;

        ctf = await ctf.save();

        await agenda.schedule(
            moment(ctf.start).subtract(1, 'hour').toDate(),
            NOTIFY_CTF_REACTORS, { ctf: ctf.id })
    }

    @Command({
        desc: 'Add credentials to the pinned CTFBot message',
        usage: '!addcreds field1=val1 field2=val2...'
    })
    async addcreds(args: CmdRunArgs){
        let newCreds = args.args.map(x => x.split("="))
            .filter(x => x.length===2)
            .filter(x => x[0].indexOf("```") === -1 && x[1].indexOf("```") === -1);

        let ctf = await Ctf.getCtf(args.msg.channel as TextChannel);
        if(!ctf) {
            args.msg.channel.send(Ctf.NotCtfChannel);
            return;
        };

        for(let [key, val] of newCreds){
            ctf.credentials[key] = val;
        }
        await ctf.save();

        let mainMessage = await Ctf.getCtfMainMessageFromCtfAndChannel(ctf, args.msg.channel as TextChannel);
        await mainMessage.edit(Ctf.createCtfMainMesssageEmbed(ctf));
    }

    @Command({
        desc: 'Remove credentials from the pinned CTFBot message',
        usage: '!rmvcreds field1 field2 ...'
    })
    async rmvcreds(args: CmdRunArgs){
        let ctf = await Ctf.getCtf(args.msg.channel as TextChannel);
        if(!ctf) {
            args.msg.channel.send(Ctf.NotCtfChannel);
            return;
        };
        
        for(let key of args.args){
            delete ctf.credentials[key];
        }
        await ctf.save();

        let mainMessage = await Ctf.getCtfMainMessageFromCtfAndChannel(ctf, args.msg.channel as TextChannel);
        await mainMessage.edit(Ctf.createCtfMainMesssageEmbed(ctf));
    }

    @Command({
        desc: 'Archive a CTF',
    })
    async archive(args: CmdRunArgs) {
        let channel = args.msg.channel as TextChannel;
        let ctf = await Ctf.getCtf(args.msg.channel as TextChannel);
        if(!ctf) {
            args.msg.channel.send(Ctf.NotCtfChannel);
            return;
        };
        let archive = args.msg.guild.channels.find(x => x.name === "archives");
        if(!archive){
            await channel.send('CTFs archive channel missing');
            return;
        }
        await channel.setParent(archive);
        ctf.archived = true;
        await ctf.save();
    }
   
    static NoCreds = 'None. Use `!addcreds field1=value1 field2=value2` to add credentials';
    static NotCtfChannel = 'This command is only valid in a CTF channel'

    public static async getCtf(chan: TextChannel): Promise<CTFTimeCTF|undefined> {
        return await CTFTimeCTF.findOne({discordChannelId: chan.id, archived: false});
    }

    public static async isCtfChannel(chan: TextChannel): Promise<boolean> {
        return !!await this.getCtf(chan);
    }

    public static async getCtfMainMessageFromChannel(channel: TextChannel): Promise<undefined | Message> {

        let ctf = await this.getCtf(channel);
        if(!ctf){
            channel.send(this.NotCtfChannel);
            return;
        }
        return await Ctf.getCtfMainMessageFromCtfAndChannel(ctf, channel);
    }

    public static async getCtfMainMessageFromCtf(ctf: CTFTimeCTF): Promise<undefined | Message> {
        return await this.getCtfMainMessageFromCtfAndChannel(ctf, bot.guilds.first().channels.get(ctf.discordChannelId) as TextChannel);
    }

    public static async getCtfMainMessageFromCtfAndChannel(ctf: CTFTimeCTF, channel: TextChannel){
        return await channel.fetchMessage(ctf.discordMainMessageId);
    }

    public static createCtfMainMesssageEmbed(ctftimeEvent: CTFTimeCTF){
        return new RichEmbed({
            color: 0x1e88e5,
            author: {
                name: `${ctftimeEvent.name} (${ctftimeEvent.format})`,
                icon_url: ctftimeEvent.logoUrl,
            },
            description: ctftimeEvent.description,
            fields: [
                { name: 'URL', value: ctftimeEvent.url },
                { name: 'Trello', value: ctftimeEvent.trelloUrl },
                { name: 'Timing', value: `${formatNiceSGT(ctftimeEvent.start)} - ${formatNiceSGT(ctftimeEvent.finish)}` },
                { name: 'Credentials', value:
                    Object.keys(ctftimeEvent.credentials).length === 0 ? Ctf.NoCreds :
                        Object.entries(ctftimeEvent.credentials).map(x => "```"+` ${x[0]} : ${x[1]} `+"```").join('')
                }],
            url: ctftimeEvent.url,
            footer: {
                text: `Hosted by ${ctftimeEvent.hosts.join(', ')}. React with 👌 to get a DM 1hr before the CTF starts`
            }
        })
    }
}