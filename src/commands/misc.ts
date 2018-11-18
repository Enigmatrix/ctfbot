import { Command, Commands } from './commands';

export default new Commands()
    .register(new Command('ping',
        async args => {
            await args.msg.channel.send('pong'); })
        .description('Simple Ping reply')
        .usage("!ping"));