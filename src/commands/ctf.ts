import { Command, CmdRunArgs, CommandGroup, Group } from './commands';
import trello from '../trello';
import { TextChannel, RichEmbed, Message, RichEmbedOptions, MessageEmbed, MessageEmbedField, Channel } from 'discord.js';
import { isCtfTimeUrl, getCtftimeEvent } from '../ctftime';
import { formatNiceSGT } from '../util';
import logger from '../logger';
import agenda, { NOTIFY_CTF_REACTORS } from '../agenda';
import moment from 'moment';

@Group('CTF')
class Ctf extends CommandGroup {

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
            await channel.send(args.cmd.usage);
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
    
        let mainMessage = await newChannel.send(new RichEmbed({
            color: 0x1e88e5,
            author: {
                name: `${ctftimeEvent.title} (${ctftimeEvent.format})`,
                icon_url: ctftimeEvent.logo === "" ? undefined : ctftimeEvent.logo
            },
            description: ctftimeEvent.description,
            fields: [
                { name: 'URL', value: ctftimeEvent.url },
                { name: 'Trello', value: board.shortUrl },
                { name: 'Timing', value: `${formatNiceSGT(ctftimeEvent.start)} - ${formatNiceSGT(ctftimeEvent.finish)}` },
                { name: 'Credentials', value: Ctf.NoCreds }],
            url: ctftimeEvent.url,
            footer: {
                text: `Hosted by ${ctftimeEvent.organizers.map(x => x.name).join(', ')}. React with 👌 to get a DM 1hr before the CTF starts`
            }
        }));
        let messages = mainMessage instanceof Message ? [mainMessage] : mainMessage;
        for(let message of messages){
            await message.pin();
        }
        await messages[messages.length-1].react('👌');

        await agenda.schedule(
            moment(ctftimeEvent.start).subtract(moment.duration(1, 'hour')).toDate(),
            NOTIFY_CTF_REACTORS, {messageId: messages[messages.length-1].id, channelId: newChannel.id, ctftimeEvent })

    }

    @Command({
        desc: 'Add credentials to the pinned CTFBot message',
        usage: '!addcreds field1=val1 field2=val2...'
    })
    async addcreds(args: CmdRunArgs){
        let setFields = args.args.map(x => x.split("="))
            .filter(x => x.length===2)
            .filter(x => x[0].indexOf("```") === -1 && x[1].indexOf("```") === -1);

        let result = await Ctf.getCtfChannelDetails(args.msg.channel);
        if(!result) return;
        let [mainMessage, embed, creds] = result;

        let credentials = new Credentials(creds.value);
        setFields.forEach(([key, val]) => {
            credentials.add(key, val);
        });
        creds.value = credentials.toString();

        let copy = Object.assign({}, embed) as unknown as RichEmbedOptions;
        await mainMessage.edit(new RichEmbed(copy));
    }

    @Command({
        desc: 'Remove credentials from the pinned CTFBot message',
        usage: '!rmvcreds field1 field2 ...'
    })
    async rmvcreds(args: CmdRunArgs){
        let result = await Ctf.getCtfChannelDetails(args.msg.channel);
        if(!result) return;
        let [mainMessage, embed, creds] = result;

        let credentials = new Credentials(creds.value);
        args.args.forEach(x => credentials.rmv(x));
        creds.value = credentials.toString();

        let copy = Object.assign({}, embed) as unknown as RichEmbedOptions;
        await mainMessage.edit(new RichEmbed(copy));
    }

    @Command({
        desc: 'Archive a CTF',
    })
    async archive(args: CmdRunArgs){
        //untested
        let channel = args.msg.channel as TextChannel;
        let details = Ctf.getCtfChannelDetails(channel);
        if(!details){
            await channel.send('Use !archive in a CTF channel');
            return;
        }
        let archive = args.msg.guild.channels.find(x => x.name === "archives");
        if(!archive){
            await channel.send('CTFs archive channel missing');
            return;
        }

        await channel.setParent(archive);
    }
   
    static NoCreds = 'None. Use `!addcreds field1=value1 field2=value2`to add credentials';

    static async getCtfChannelDetails(chan: Channel): Promise<undefined | [Message, MessageEmbed, MessageEmbedField]> {
        let channel = chan as TextChannel;
        if(channel.parent.name !== "CTFs"){
            channel.send("!addcreds can only be used in a CTF channel");
            return;
        }
        let pinned = await channel.fetchPinnedMessages();
        let mainMessage = pinned.size === 0 ? undefined : pinned.first();
        if(!mainMessage || mainMessage.author.id !== channel.client.user.id || mainMessage.embeds.length === 0){
            channel.send("!addcreds can only be used in a CTF channel");
            return;
        }
        let embed = mainMessage.embeds[0];
        let creds = embed.fields.find(x => x.name === 'Credentials');
        if(!creds){
            logger.error('Credentials not found on pinned CTF message');
            return;
        }
        return [mainMessage, embed, creds];
    }
}


class Credentials {
    private credMap: Map<string, string>;

    constructor(value: string){
        this.credMap = new Map<string, string>();
        if(value === Ctf.NoCreds)
            value = "";
        let stuff = value.split('```').filter(x => x !== '\n' && x !== '');
        for(let s of stuff){
            let [key, val] = s.split(" : ");
            this.credMap.set(key.substr(1), val.substr(0, val.length-1));
        }
    }

    add(key: string, value: string){
        this.credMap.set(key, value);
    }

    rmv(key: string){
        this.credMap.delete(key);
    }

    toString(){
        return this.credMap.size === 0 ? Ctf.NoCreds :
            Array.from(this.credMap.entries()).map(x => "```"+` ${x[0]} : ${x[1]} `+"```").join('')
    }
}
