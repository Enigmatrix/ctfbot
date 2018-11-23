import { CommandGroup, Command, CmdRunArgs } from "./commands";
import { trello, trelloEx } from "../trello";
import { Ctf } from "./ctf";
import { TextChannel } from "discord.js";
import { Challenge } from "../entities/ctf";

class Challenges extends CommandGroup {

    @Command({
        desc: 'Add a challenge to this CTF',
        usage: '!addchall <name> <category1>,<category2>..'
    })
    async addchall(args: CmdRunArgs){
        let channel = args.msg.channel as TextChannel;
        let categories = args.args[1].split(',').map(x => x.toLowerCase());
        if(args.args.length !== 2){
            channel.send(args.cmd.usage);
            return;
        }
        let ctf = await Ctf.getCtf(channel);
        if(!ctf){
            channel.send(Ctf.NotCtfChannel);
            return;
        }
        let boardId = await trelloEx.board.extractId(ctf.trelloUrl)
        let board = await trello.board.search(boardId);
        console.log(board);
        let todo = await trelloEx.board.getList(boardId, 'To Do');
        if(!todo){
            channel.send('Trello `To Do` list is missing');
            return;
        }

        let card = await trello.card.create({
            name: args.args[0],
            idList: todo.id,
            pos: 'top',
            idLabels: []
        });

        // setup webhooks for the card here

        ctf.challenges.push(new Challenge(args.args[0], categories))
        await ctf.save();
    }

    @Command({
        desc: 'Remove a challenge from this CTF',
        usage: '!rmvchall <name>'
    })
    async rmvchall(args: CmdRunArgs){
        await super.NotImplemented(args);
    }

    @Command({
        desc: 'Signal that you are working on a challenge',
        usage: '!workon <name>'
    })
    async workon(args: CmdRunArgs){
        await super.NotImplemented(args);
    }

    @Command({
        desc: 'Signal that you are not working on a challenge anymore',
        usage: '!ditch <name>'
    })
    async ditch(args: CmdRunArgs){
        await super.NotImplemented(args);
    }

    @Command({
        desc: 'Signal that you have solved a challenge',
        usage: '!solve <name>'
    })
    async solve(args: CmdRunArgs){
        await super.NotImplemented(args);
    }

    @Command({
        desc: 'Signal that the challenge needs to put up again',
        usage: '!unsolve <name>'
    })
    async unsolve(args: CmdRunArgs){
        await super.NotImplemented(args);
    }
}