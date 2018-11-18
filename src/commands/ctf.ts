import commands, { Command, Commands } from './commands';

commands
    .register(new Command('addctf',
        async args => {})
        .description('Add a new ctf')
        .usage("!addctf"));
