import commands, { Command } from './commands';

commands
    .register(new Command('ping',
        async args => {
            await args.msg.channel.send('pong'); })
        .description('Simple Ping reply')
        .usage("!ping"));