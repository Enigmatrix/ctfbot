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
        .description('Simple Ping reply')
        .usage("!ping"))
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
        

    }));