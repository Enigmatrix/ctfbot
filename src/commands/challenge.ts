import { CommandGroup, Command, CmdRunArgs } from "./commands";

class Challenge extends CommandGroup {

    @Command({
        desc: 'Add a challenge to this CTF',
        usage: '!addchall <name> <category1>,<category2>..'
    })
    async addchall(args: CmdRunArgs){

    }

    @Command({
        desc: 'Remove a challenge from this CTF',
        usage: '!rmvchall <name>'
    })
    async rmvchall(args: CmdRunArgs){
        
    }

    @Command({
        desc: 'Signal that you are working on a challenge',
        usage: '!workon <name>'
    })
    async workon(args: CmdRunArgs){

    }

    @Command({
        desc: 'Signal that you are not working on a challenge anymore',
        usage: '!ditch <name>'
    })
    async ditch(args: CmdRunArgs){

    }

    @Command({
        desc: 'Signal that you have solved a challenge',
        usage: '!solve <name>'
    })
    async solve(args: CmdRunArgs){

    }

    @Command({
        desc: 'Signal that the challenge needs to put up again',
        usage: '!unsolve <name>'
    })
    async unsolve(args: CmdRunArgs){

    }
}