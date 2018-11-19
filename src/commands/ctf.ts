import commands, { Command } from './commands';
import trello from '../trello';
import { TextChannel, RichEmbed, Message, RichEmbedOptions, MessageEmbed, MessageEmbedField } from 'discord.js';
import { isCtfTimeUrl, getCtftimeEvent } from '../ctftime';
import { formatNiceSGT } from '../util';
import logger from '../logger';
import agenda, { NOTIFY_CTF_REACTORS } from '../agenda';
import moment = require('moment');

// get upcoming list of ctf

// add ctf -> create trello board, get link to ctf, organize username, password, group name?
const NoCreds = 'None. Use `!addcreds field1=value1 field2=value2`to add credentials';

let findCredentialsEmbed = async (msg: Message): Promise<undefined | [Message, MessageEmbed, MessageEmbedField]> => {
    let channel = msg.channel as TextChannel;
    if(channel.parent.name !== "CTFs"){
        channel.send("!addcreds can only be used in a CTF channel");
        return;
    }
    let pinned = await channel.fetchPinnedMessages();
    let mainMessage = pinned.size === 0 ? undefined : pinned.first();
    if(!mainMessage || mainMessage.author.id !== msg.client.user.id || mainMessage.embeds.length === 0){
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

class Credentials {
    private credMap: Map<string, string>;

    constructor(value: string){
        this.credMap = new Map<string, string>();
        if(value === NoCreds)
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
        return this.credMap.size === 0 ? NoCreds :
            Array.from(this.credMap.entries()).map(x => "```"+` ${x[0]} : ${x[1]} `+"```").join('')
    }
}


commands
    .register(new Command('addctf',
        async args => {
            let ctftimeUrl = args.args[0];
            let {guild, channel} = args.msg;
            if(!ctftimeUrl || !isCtfTimeUrl(ctftimeUrl)){
                await channel.send(args.cmd._usage);
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
                    { name: 'Url', value: ctftimeEvent.url },
                    { name: 'Trello', value: board.shortUrl },
                    { name: 'Timing', value: `${formatNiceSGT(ctftimeEvent.start)} - ${formatNiceSGT(ctftimeEvent.finish)}` },
                    { name: 'Credentials', value: NoCreds }],
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
            
        })
        .description('Add a new ctf')
        .usage("!addctf <ctftime_url>"))
    .register(new Command('addcreds',
        async args => {
            let setFields = args.args.map(x => x.split("="))
                .filter(x => x.length===2)
                .filter(x => x[0].indexOf("```") === -1 && x[1].indexOf("```") === -1);

            let result = await findCredentialsEmbed(args.msg);
            if(!result) return;
            let [mainMessage, embed, creds] = result;

            if(creds.value === NoCreds){
                creds.value = "";
            }
            let credentials = new Credentials(creds.value);
            setFields.forEach(([key, val]) => {
                credentials.add(key, val);
            });
            creds.value = credentials.toString();

            let copy = Object.assign({}, embed) as unknown as RichEmbedOptions;
            await mainMessage.edit(new RichEmbed(copy));
        })
        .usage('!addcreds field1=value1 field2=value2')
        .description('Adds credentials to the pinned CTFBot message.'))
    .register(new Command('rmvcreds',
        async args => {
            let result = await findCredentialsEmbed(args.msg);
            if(!result) return;
            let [mainMessage, embed, creds] = result;

            if(creds.value === NoCreds) return;
            let credMap = creds.value.split('\n').map(x => x.split(' : '));
            args.args.forEach(name =>{
                let c = credMap.findIndex(x => x[0].substring(5, x[0].length-4) === name);
                if(!c) return;
                credMap.splice(c, 1);
            });
            let credentials = new Credentials(creds.value);
            args.args.forEach(x => credentials.rmv(x));
            creds.value = credentials.toString();

            let copy = Object.assign({}, embed) as unknown as RichEmbedOptions;
            await mainMessage.edit(new RichEmbed(copy));
        })
        .usage('!rmvcreds field1 field2')
        .description('Removes credentials from the pinned CTFBot message.'))
    .register(new Command('addchallenge',
        async args => {})
        .usage('!addchallenge <challenge_name> <category>')
        .description("Add a new challenge for the current ctf"));
