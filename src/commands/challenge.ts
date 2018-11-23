import { CommandGroup, Command, CmdRunArgs } from "./commands";
import { trello, trelloEx } from "../trello";
import { Ctf } from "./ctf";
import { TextChannel } from "discord.js";
import { Challenge, CTFTimeCTF } from "../entities/ctf";
import { User } from "../entities/user";
import { ContinuationStop } from "../util";
import { CtfTime } from "../ctftime";
import { ObjectID } from "typeorm";

class Challenges extends CommandGroup {
    
    @Command({
        desc: 'Add a challenge to this CTF',
        usage: '!addchall <name> <category1>,<category2>..'
    })
    async addchall(args: CmdRunArgs){
        let channel = args.msg.channel as TextChannel;
        let [name, catStr] = args.checkedArgs(2);
        let categories = catStr.split(',').map(x => x.toLowerCase());
        let ctf = await Ctf.getCtf(channel).expect(
            async () => await channel.send(Ctf.NotCtfChannel));
            
        let boardId = await trelloEx.board.extractId(ctf.trelloUrl);
        let todo = await trelloEx.board.getList(boardId, 'To Do').expect(
            async () => await channel.send('Trello `To Do` list is missing'));

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
            name: name,
            idList: todo.id,
            pos: 'top',
            idLabels: categories.map(cat => existingLabels.find(x => x.name === cat))
                .filter(x => !!x)
                .map(x => (x as trelloEx.Label).id)
        });

        ctf.challenges.push(new Challenge(name, categories, card.id))
        await ctf.save();
    }

    async challengeDetails(args: CmdRunArgs): Promise<[string, CTFTimeCTF, number, Challenge]>{
        let channel = args.msg.channel as TextChannel;
        let [name] = args.checkedArgs(1);
        let ctf = await Ctf.getCtf(channel)
            .expect(async () => await channel.send(args.cmd.usage));
        let idx = ctf.challenges.findIndex(x => x.name === name);
        if(idx === -1){
            channel.send(`Challenge ${name} not found`);
            throw new ContinuationStop();
        }
        return [name, ctf, idx, ctf.challenges[idx]];
    }

    async getUserAndChallDetails(args: CmdRunArgs, chal: Challenge, workingOnByYou: boolean, solved: boolean){
        let user =  await User.findOne({discordId: args.msg.author.id}).expect(
            async () => await args.msg.reply('register with `!register <trello_profile_url>` first. // Sorry for the inconvenience'));
        let idx = chal.workers.findIndex(x => x.equals(user.id))
        if(workingOnByYou){
            if(idx === -1){
                args.msg.channel.send('Seems like you are not working on this challenge...');
                throw new ContinuationStop();
            }
        }
        else{
            if(idx !== -1){
                args.msg.channel.send('Seems like you are already working on this challenge...');
                throw new ContinuationStop();
            }
        }
        if(solved){
            if(!chal.solvedBy){
                args.msg.channel.send('Seems like the challenge is not already solved...');
                throw new ContinuationStop();
            }
        }
        else{
            if(chal.solvedBy){
                args.msg.channel.send('Seems like the challenge is already solved...');
                throw new ContinuationStop();
            }
        }
        return [user];
    }

    async getBoardList(channel: TextChannel, url: string, listName: string): Promise<[string, trelloEx.List]>{
        let boardId = await trelloEx.board.extractId(url);
        let doing = await trelloEx.board.getList(boardId, listName);
        if(!doing){
            channel.send(`Trello \`${listName}\` list is missing`);
            throw new ContinuationStop();
        }
        return [boardId, doing];
    }

    @Command({
        desc: 'Remove a challenge from this CTF',
        usage: '!rmvchall <name>'
    })
    async rmvchall(args: CmdRunArgs){
        let [name, ctf, idx, chal] = await this.challengeDetails(args);
        await trello.card.del(chal.cardId);
        ctf.challenges.splice(idx, 1);
        await ctf.save();
    }

    @Command({
        desc: 'Signal that you are working on a challenge',
        usage: '!workon <name>'
    })
    async workon(args: CmdRunArgs){
        let channel = args.msg.channel as TextChannel;
        let [name, ctf, idx, chal] = await this.challengeDetails(args);
        let [user] = await this.getUserAndChallDetails(args, chal, false, false);
        
        await trelloEx.card.addMember(chal.cardId, user.trelloId);

        let [boardId, doing] = await this.getBoardList(channel, ctf.trelloUrl, 'Doing');
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
        let [name, ctf, idx, chal] = await this.challengeDetails(args);
        let [user] = await this.getUserAndChallDetails(args, chal, true, false);

        chal.workers.splice(idx, 1);
        await trelloEx.card.rmvMember(chal.cardId, user.trelloId);

        if(chal.workers.length === 0){
            let [_, todo] = await this.getBoardList(channel, ctf.trelloUrl, 'To Do');
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
        let [name, ctf, idx, chal] = await this.challengeDetails(args);
        let [user] = await this.getUserAndChallDetails(args, chal, true, false);

        let [_, done] = await this.getBoardList(channel, ctf.trelloUrl, 'Done');
        await trelloEx.card.move(chal.cardId, done.id);
        chal.solvedBy = user.id;
        await ctf.save();
    }

    @Command({
        desc: 'Signal that the challenge needs to put up again',
        usage: '!unsolve <name>'
    })
    async unsolve(args: CmdRunArgs){
        let channel = args.msg.channel as TextChannel;
        let [name, ctf, idx, chal] = await this.challengeDetails(args);
        let [user] = await this.getUserAndChallDetails(args, chal, true, true);
        if(!(chal.solvedBy as ObjectID).equals(user.id)){
            channel.send('Only the solver can !unsolve');
            return;
        }

        let [_, doing] = await this.getBoardList(channel, ctf.trelloUrl, 'Doing');
        await trelloEx.card.move(chal.cardId, doing.id);
        chal.solvedBy = undefined;
        
        await ctf.save();
    }
}