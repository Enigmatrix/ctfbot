import commands, { Command, Commands } from './commands';

commands
    .register(new Command('ping',
        async args => {
            await args.msg.channel.send('pong'); })
        .description('Simple Ping reply')
        .usage("!ping"));