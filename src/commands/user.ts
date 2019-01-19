import { User } from "../entities/user";
import { trelloEx } from "../trello";
import { CmdRunArgs, Command, CommandGroup } from "./commands";

class Users extends CommandGroup {

    @Command({
        desc: "Register a trello profile url (e.g. https://trello.com/iamuser) with your Discord account",
        usage: "!register <trello_profile_url>",
    })
    public async register(args: CmdRunArgs) {
        const [trelloUrl] = args.checkedArgs(1);
        const trelloId = await trelloEx.member.extractId(trelloUrl)
            .expect(async () => await args.printUsage());
        let user: User;
        user = await User.findOne({ discordId: args.msg.author.id })
            .expect(async () => {
                user = new User();
                user.discordId = args.msg.author.id;
            });
        user.trelloId = trelloId;
        await user.save();
    }
}
