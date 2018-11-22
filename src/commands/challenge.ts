import { CommandGroup, Command, CmdRunArgs } from "./commands";
import { RichEmbed, Channel, TextChannel, Message, MessageEmbed } from "discord.js";
import { Ctf } from "./ctf";
import { cloneEmbed } from "../util";
import bot from "../bot";

class Challenge extends CommandGroup {

    public static async getCtfChallengesDetails(chan: Channel): Promise<undefined | Message> {
        let channel = chan as TextChannel;

        let pinned = await channel.fetchPinnedMessages();
        let mainMessage = pinned.find(x => x.embeds.length === 1 && x.embeds[0].author.name === 'Challenges');
        if(!mainMessage || mainMessage.author.id !== channel.client.user.id)
            return;
        return mainMessage;
    }
    static Icon = 'https://www.clipartmax.com/png/small/288-2887472_the-gallery-for-car-icon-top-view-png-challenge-icon.png';
    static EmptyWorkers = 'No workers. Run `!workon <name>` to signal your involvement.';

    @Command({
        desc: 'Add a challenge to this CTF',
        usage: '!addchall <name> <category1>,<category2>..'
    })
    async addchall(args: CmdRunArgs){
        let channel = args.msg.channel as TextChannel;
        if(!await Ctf.isCtfChannel(channel)) return;

        if(args.args.length !== 2){
            channel.send('Usage: '+args.cmd.usage);
            return;
        }

        let challengeMsg = await Challenge.getCtfChallengesDetails(channel);
        if(challengeMsg === undefined){
            challengeMsg = await channel.send(new RichEmbed({
                author: {
                    icon_url: Challenge.Icon,
                    name: 'Challenges'
                },
                color: 0xff8f00
            })) as Message;
            await challengeMsg.pin();
        }
        
        let embed = challengeMsg.embeds[0];
        embed.fields.push({
            name: args.args[0],
            value: `*${args.args[1].split(',').join(', ')}*\nworkers: ${Challenge.EmptyWorkers}`,
            inline: false,
            embed
        });
        
        await challengeMsg.edit(new RichEmbed(cloneEmbed(embed)));
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