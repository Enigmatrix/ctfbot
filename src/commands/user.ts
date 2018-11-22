import { CommandGroup, Command, CmdRunArgs } from "./commands";
import { User } from "../entities/user";
import { isTrelloMemberUrl, extractMemberId } from "../trello";

class Users extends CommandGroup {

    @Command({
        desc: 'Register a trello profile url (e.g. https://trello.com/iamuser) with your Discord account',
        usage: '!register <trello_profile_url>'
    })
    async register(args: CmdRunArgs){
        if(!args.args[0] || !isTrelloMemberUrl(args.args[0])){
            args.msg.channel.send(args.cmd.usage);
            return;
        }
        let user = await User.findOne({discordId: args.msg.author.id});
        if(!user){
            user = await new User();
            user.discordId = args.msg.author.id;
        }
        user.trelloId = extractMemberId(args.args[0]);
        await user.save();
    }
}