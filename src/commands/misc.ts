import commands, { Command } from './commands';
import logger from '../logger';
import { Message, RichEmbed } from 'discord.js';
import moment = require('moment');
import agenda from '../agenda';
import { limit, formatNiceSGT } from '../util';

commands
    .register(new Command('ping',
        async args => {
            await args.msg.channel.send('pong'); })
        .description('Simple Ping reply'))
    .register(new Command('status', async args => {
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
    })
        .description('Show status message'))
    .register(new Command('help',
        async args => {
            if(args.args[0] === undefined)
                args.msg.channel.send(new RichEmbed({
                    title: ':question: Help',
                    color: 0x00e676,
                    fields: Array.from(commands.commandMap.entries())
                        .map(([key,cmd]) => { return {
                            name: key,
                            value: `**${cmd._usage}**\n${cmd._description}`
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
                        value: `**${cmd._usage}**\n${cmd._description}`
                    }]
                }));
            }
            else{
                args.msg.channel.send(new RichEmbed({
                    title: ':question: Command not found',
                    color: 0xff1744
                }));
            }


        })
        .usage('!help\n!help <cmd>')
        .description('Print this help message'));