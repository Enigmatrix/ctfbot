import commands, { Command, CmdRunArgs, CommandGroup, Group } from './commands';
import { Message, RichEmbed, TextChannel } from 'discord.js';
import moment from 'moment';
import agenda from '../agenda';
import { formatNiceSGT } from '../util';
import { Ctf } from './ctf';
import { trello, trelloEx } from '../trello';

@Group('Miscellaneous')
class Misc extends CommandGroup {

    /*
    @Command({})
    async testupcoming(args: CmdRunArgs){
        await agenda.now(NOTIFY_UPCOMING_CTF, { channelId: args.msg.channel.id });
    }*/

    @Command({})
    async continuation(args: CmdRunArgs){
        let channel = args.msg.channel as TextChannel;
        let ctf = await Ctf.getCtf(channel)
            .ifNot(() => channel.send('continuation success'));
        console.log('ur mum');
    }
    

    @Command({
        desc: 'Simple ping reply'
    })
    async ping(args: CmdRunArgs){
        await args.msg.channel.send('pong');
    }

    @Command({
        desc: 'Show status message'
    })
    async status(args: CmdRunArgs){
        let {channel} = args.msg;
        let uptime = process.uptime()
        let mem = process.memoryUsage().rss;

        let pingStart = Date.now();
        let msg = await channel.send(new RichEmbed({title: "Pinging...", color: 0xffeb3b})) as Message;
        let pingEnd = Date.now();
        let jobs = await agenda.jobs({nextRunAt: {$gte: new Date()}});
        
        msg.edit(new RichEmbed({
            title: 'Status',
            color: 0x00e676,
            description: 
                `**Ping**: ${(pingEnd-pingStart)} ms\n`+
                `**Uptime**: ${moment.duration(uptime, "seconds").humanize()}\n`+
                `**Memory**: ${Math.floor(mem/(1024*1024*1024))}gb ${Math.floor((mem%(1024*1024*1024))/(1024*1024))}mb ${Math.floor((mem%(1024*1024)/1024))}kb ${Math.floor(mem%1024)}b\n`+
                `**Jobs**:\n`+jobs.map(x => 
                    `_${formatNiceSGT(x.attrs.nextRunAt)}_:\n${x.attrs.name}`).join('\n\n')
        }));
    }

    @Command({
        desc: 'Print help message',
        usage: '!help\n!help <cmd>'
    })
    async help(args: CmdRunArgs){
        if(args.args[0] === undefined)
            args.msg.channel.send(new RichEmbed({
                title: ':question: Help',
                color: 0x00e676,
                fields: Array.from(commands.commandMap.entries())
                    .map(([key,cmd]) => { return {
                        name: key,
                        value: `**${cmd.usage}**\n${cmd.description}`
                    }})
            }));
        else if(commands.commandMap.has(args.args[0])){
            let cmd = commands.commandMap.get(args.args[0]);
            if(!cmd)return;
            args.msg.channel.send(new RichEmbed({
                title: ':question: Help for '+args.args,
                color: 0x00e676,
                fields: [{
                    name: args.args[0],
                    value: `**${cmd.usage}**\n${cmd.description}`
                }]
            }));
        }
        else{
            args.msg.channel.send(new RichEmbed({
                title: ':question: Command not found',
                color: 0xff1744
            }));
        }
    }
}