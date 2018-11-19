import commands, { Command } from './commands';
import trello from '../trello';
import { TextChannel, RichEmbed, Message } from 'discord.js';
import { isCtfTimeUrl, getCtftimeEvent } from '../ctftime';
import moment from 'moment';
import { formatNiceSGT } from '../util';

// get upcoming list of ctf

// add ctf -> create trello board, get link to ctf, organize username, password, group name?

commands
    .register(new Command('richembedtest', async args => {
            await args.msg.channel.send(new RichEmbed({
                color: 0x1e88e5,
                fields: [
                    {
                        name: 'Trello',
                        value: 'wew',
                        inline: true
                    },{name: 'User', value: 'rgtrtg', inline: true}],
                author: {
                    name: 'Information for ',
                    icon_url: 'https://ctftime.org/media/cache/8d/6e/8d6e60dd2949a3603f597caab9faa45f.png'
                }

            }));

    }))
    .register(new Command('addctf',
        async args => {
            let ctftimeUrl = args.args[0];
            let {guild, channel} = args.msg;
            if(!ctftimeUrl || !isCtfTimeUrl(ctftimeUrl)){
                await channel.send('Usage: !addctf <ctftime_url> ');
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
                    {
                        name: 'Url',
                        value: ctftimeEvent.url
                    },
                    {
                        name: 'Trello',
                        value: board.shortUrl,
                    },
                    {
                        name: 'Timing',
                        value: `${formatNiceSGT(ctftimeEvent.start)} - ${formatNiceSGT(ctftimeEvent.finish)}`
                    },
                    {
                        name: 'Credentials',
                        value: 'None. Use `!addcreds field1=value1 field2=value2`to add credentials',
                    }],
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

            //signal watching :ok_hand:
        })
        .description('Add a new ctf')
        .usage("!addctf <ctftime_url>"))
    .register(new Command('addchallenge',
        async args => {})
        .description("Add a new challenge for the current ctf"))
