import { CommandGroup, Command, CmdRunArgs } from "./commands";
import { trello, trelloEx } from "../trello";
import { Ctf } from "./ctf";
import { TextChannel } from "discord.js";
import { Challenge } from "../entities/ctf";
import { User } from "../entities/user";

class Challenges extends CommandGroup {

    @Command({
        desc: 'Add a challenge to this CTF',
        usage: '!addchall <name> <category1>,<category2>..'
    })
    async addchall(args: CmdRunArgs){
        let channel = args.msg.channel as TextChannel;
        if(args.args.length !== 2){
            channel.send(args.cmd.usage);
            return;
        }
        let categories = args.args[1].split(',').map(x => x.toLowerCase());
        let ctf = await Ctf.getCtf(channel);
        if(!ctf){
            channel.send(Ctf.NotCtfChannel);
            return;
        }
        let boardId = await trelloEx.board.extractId(ctf.trelloUrl);
        let todo = await trelloEx.board.getList(boardId, 'To Do');
        if(!todo){
            channel.send('Trello `To Do` list is missing');
            return;
        }

        let existingLabels = await trelloEx.board.getLabels(boardId);
        for(let cat of categories){
            if(!existingLabels.find(x => x.name === cat)){
                let label = await trello.label.create({
                    name: cat,
                    color: trelloEx.randomTrelloColor(),
                    idBoard: boardId }) as trelloEx.Label;
                existingLabels.push(label);
            }
        }

        let card: trelloEx.Card = await trello.card.create({
            name: args.args[0],
            idList: todo.id,
            pos: 'top',
            idLabels: categories.map(cat => existingLabels.find(x => x.name === cat))
                .filter(x => !!x)
                .map(x => (x as trelloEx.Label).id)
        });

        ctf.challenges.push(new Challenge(args.args[0], categories, card.id))
        await ctf.save();
    }

    @Command({
        desc: 'Remove a challenge from this CTF',
        usage: '!rmvchall <name>'
    })
    async rmvchall(args: CmdRunArgs){
        let channel = args.msg.channel as TextChannel;
        let name = args.args[0];
        if(!name){
            channel.send(args.cmd.usage);
            return;
        }
        let ctf = await Ctf.getCtf(channel);
        if(!ctf){
            channel.send(Ctf.NotCtfChannel);
            return;
        }
        let chalIdx = ctf.challenges.findIndex(x => x.name === name);
        if(chalIdx === -1){
            channel.send(`Challenge ${name} not found`);
            return;
        }
        let chal = ctf.challenges[chalIdx];
        await trello.card.del(chal.cardId);
        ctf.challenges.splice(chalIdx, 1);
        await ctf.save();
    }

    @Command({
        desc: 'Signal that you are working on a challenge',
        usage: '!workon <name>'
    })
    async workon(args: CmdRunArgs){
        let channel = args.msg.channel as TextChannel;
        let name = args.args[0];
        if(!name){
            channel.send(args.cmd.usage);
            return;
        }
        let ctf = await Ctf.getCtf(channel);
        if(!ctf){
            channel.send(Ctf.NotCtfChannel);
            return;
        }
        let chal = ctf.challenges.find(x => x.name === name);
        if(!chal){
            channel.send(`Challenge ${name} not found`);
            return;
        }
        let authorId = args.msg.author.id;
        let user = await User.findOne({discordId: authorId});
        if(!user){
            args.msg.reply('register with `!register <trello_profile_url>` first. // Sorry for the inconvenience');
            return;
        }
        let userId = user.id;
        if(chal.workers.findIndex(x => x.equals(userId)) >= 0){
            channel.send('Seems like you are already working on this challenge...');
            return;
        }
        if(chal.solvedBy){
            channel.send('Seems like this challenge has been solved...')
            return;
        }
        
        await trelloEx.card.addMember(chal.cardId, user.trelloId);

        let boardId = await trelloEx.board.extractId(ctf.trelloUrl);
        let doing = await trelloEx.board.getList(boardId, 'Doing');
        if(!doing){
            channel.send('Trello `Doing` list is missing');
            return;
        }

        await trelloEx.card.move(chal.cardId, doing.id);

        chal.workers.push(user.id);
        await ctf.save();
    }

    @Command({
        desc: 'Signal that you are not working on a challenge anymore',
        usage: '!ditch <name>'
    })
    async ditch(args: CmdRunArgs){
        let channel = args.msg.channel as TextChannel;
        let name = args.args[0];
        if(!name){
            channel.send(args.cmd.usage);
            return;
        }
        let ctf = await Ctf.getCtf(channel);
        if(!ctf){
            channel.send(Ctf.NotCtfChannel);
            return;
        }
        let chal = ctf.challenges.find(x => x.name === name);
        if(!chal){
            channel.send(`Challenge ${name} not found`);
            return;
        }
        let authorId = args.msg.author.id;
        let user = await User.findOne({discordId: authorId});
        if(!user){
            args.msg.reply('register with `!register <trello_profile_url>` first. // Sorry for the inconvenience');
            return;
        }
        let userId = user.id;
        const idx = chal.workers.findIndex(x => x.equals(userId));
        if(idx === -1){
            channel.send('Seems like you are not working on this challenge...');
            return;
        }
        if(chal.solvedBy){
            channel.send('Seems like this challenge has been solved...')
            return;
        }
        
        chal.workers.splice(idx, 1);
        await trelloEx.card.rmvMember(chal.cardId, user.trelloId);

        if(chal.workers.length === 0){
            let boardId = await trelloEx.board.extractId(ctf.trelloUrl);
            let todo = await trelloEx.board.getList(boardId, 'To Do');
            if(!todo){
                channel.send('Trello `To Do` list is missing');
                return;
            }
            await trelloEx.card.move(chal.cardId, todo.id);
        }

        await ctf.save();

    }

    @Command({
        desc: 'Signal that you have solved a challenge',
        usage: '!solve <name>'
    })
    async solve(args: CmdRunArgs){
        let channel = args.msg.channel as TextChannel;
        let name = args.args[0];
        if(!name){
            channel.send(args.cmd.usage);
            return;
        }
        let ctf = await Ctf.getCtf(channel);
        if(!ctf){
            channel.send(Ctf.NotCtfChannel);
            return;
        }
        let chal = ctf.challenges.find(x => x.name === name);
        if(!chal){
            channel.send(`Challenge ${name} not found`);
            return;
        }
        let authorId = args.msg.author.id;
        let user = await User.findOne({discordId: authorId});
        if(!user){
            args.msg.reply('register with `!register <trello_profile_url>` first. // Sorry for the inconvenience');
            return;
        }
        let userId = user.id;
        const idx = chal.workers.findIndex(x => x.equals(userId));
        if(idx === -1){
            channel.send('Seems like you are not working on this challenge...');
            return;
        }
        if(chal.solvedBy){
            channel.send('Seems like this challenge has been solved...')
            return;
        }

        let boardId = await trelloEx.board.extractId(ctf.trelloUrl);
        let done = await trelloEx.board.getList(boardId, 'Done');
        if(!done){
            channel.send('Trello `To Do` list is missing');
            return;
        }
        await trelloEx.card.move(chal.cardId, done.id);
        chal.solvedBy = userId;
        await ctf.save();
    }

    @Command({
        desc: 'Signal that the challenge needs to put up again',
        usage: '!unsolve <name>'
    })
    async unsolve(args: CmdRunArgs){
        let channel = args.msg.channel as TextChannel;
        let name = args.args[0];
        if(!name){
            channel.send(args.cmd.usage);
            return;
        }
        let ctf = await Ctf.getCtf(channel);
        if(!ctf){
            channel.send(Ctf.NotCtfChannel);
            return;
        }
        let chal = ctf.challenges.find(x => x.name === name);
        if(!chal){
            channel.send(`Challenge ${name} not found`);
            return;
        }
        let authorId = args.msg.author.id;
        let user = await User.findOne({discordId: authorId});
        if(!user){
            args.msg.reply('register with `!register <trello_profile_url>` first. // Sorry for the inconvenience');
            return;
        }
        let userId = user.id;
        const idx = chal.workers.findIndex(x => x.equals(userId));
        if(idx === -1){
            channel.send('Seems like you are not working on this challenge...');
            return;
        }
        if(!chal.solvedBy){
            channel.send('Seems like this challenge has not been solved...')
            return;
        }
        if(!chal.solvedBy.equals(userId)){
            channel.send('Only the solver can !unsolve');
            return;
        }

        let boardId = await trelloEx.board.extractId(ctf.trelloUrl);
        let doing = await trelloEx.board.getList(boardId, 'Doing');
        if(!doing){
            channel.send('Trello `Doing` list is missing');
            return;
        }
        await trelloEx.card.move(chal.cardId, doing.id);
        chal.solvedBy = undefined;
        
        await ctf.save();
    }
}