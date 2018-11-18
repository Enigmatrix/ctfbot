import { Command, Commands } from './commands';

export default new Commands()
    .register(new Command('addctf',
        async args => {})
        .description('Add a new ctf')
        .usage("!addctf"));
