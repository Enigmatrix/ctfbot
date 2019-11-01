import { Challenge } from "../db/entities/ctf";
import { User } from "../db/entities/user";
import { getCTFTimeCTF } from "../services/ctf";
import {
  Board,
  Card,
  Label,
  List,
  randomTrelloColor
} from "../services/trello";
import { CommandError } from "../utils/message";
import { CmdCtx, Command, CommandGroup, Group } from "./definitions";

@Group("Challenge")
export default class Challenges extends CommandGroup {
  @Command({
    desc: "Add a challenge to this CTF",
    usage: "!addchall <name> <category1>,<category2>.."
  })
  public async addchall(ctx: CmdCtx) {
    const [name, catStr] = ctx.args;
    const categories = catStr.split(",");

    await ctx
      .flow()

      .step("Getting info from db and Trello", async () => {
        const ctf = await getCTFTimeCTF(ctx);
        const { boardId, list } = await this.boardList(ctf.url, "To Do");
        return { ctf, todo: list, boardId };
      })

      .step("Creating Trello card", async ({ todo, boardId }) => {
        const existingLabels = await Label.getAll(boardId);
        const labels: Label[] = [];

        // create or use existing labels for respective categories
        for (const cat of categories) {
          const label =
            existingLabels.find(x => x.name === cat) ||
            (await Label.create(boardId, {
              name: cat,
              color: randomTrelloColor()
            }));
          labels.push(label);
        }

        const card = await Card.create({
          name,
          idList: todo.id,
          pos: "top",
          idLabels: labels.map(x => x.id as string)
        });
        return { card };
      })

      .step("Saving challenge to db", async ({ ctf, card }) => {
        ctf.challenges.push(new Challenge(name, categories, card.id));
        await ctf.save();
      })

      .run(async ({ card }) => `Challenge info created at ${card.shortUrl}`);
  }

  @Command({
    desc: "Signal that you are working on a challenge",
    usage: "!workon <name>"
  })
  public async workon(ctx: CmdCtx) {
    await ctx
      .flow()

      .step("Getting info from db and Trello", async () => {
        const { ctf, challenge } = await this.challenge(ctx);
        const user = await this.user(ctx, challenge, {
          workingOnByYou: false,
          alreadySolved: false
        });
        const { boardId, list: doing } = await this.boardList(
          ctf.trelloUrl,
          "Doing"
        );
        return { ctf, challenge, boardId, doing, user };
      })

      .step(
        "Adding members and moving cards",
        async ({ boardId, challenge, doing, user }) => {
          await Board.addMemberIfNotExists(boardId, user.trelloId);
          await Card.addMember(challenge.cardId, user.trelloId);
          await Card.move(challenge.cardId, doing.id);
        }
      )

      .step("Saving challenge to db", async ({ ctf, challenge, user }) => {
        challenge.workers.push(user.id);
        await ctf.save();
      })

      .run(
        async ({ challenge }) =>
          `<@${ctx.msg.author.id}> is now working on \`${challenge.name}\`!`
      );
  }

  // TODO !solve implies workon
  private async user(
    ctx: CmdCtx,
    challenge: Challenge,
    opts: {
      workingOnByYou: boolean;
      alreadySolved: boolean;
    }
  ) {
    const user = await User.findOne({ discordId: ctx.msg.author.id });
    if (!user) {
      throw new CommandError(
        "register with `!register <trello_profile_url>` first. // Sorry for the inconvenience"
      );
    }
    const idx = challenge.workers.findIndex(x => x.equals(user.id));
    if (opts.workingOnByYou && idx === -1) {
      throw new CommandError(
        "Seems like you are not working on this challenge..."
      );
    } else if (idx !== -1) {
      throw new CommandError(
        "Seems like you are already working on this challenge..."
      );
    }
    if (opts.alreadySolved && !challenge.solvedBy) {
      throw new CommandError(
        "Seems like the challenge is not already solved..."
      );
    } else if (challenge.solvedBy) {
      throw new CommandError("Seems like the challenge is already solved...");
    }
    return user;
  }

  private async challenge(ctx: CmdCtx) {
    const [name] = ctx.args;
    const ctf = await getCTFTimeCTF(ctx);
    const idx = ctf.challenges.findIndex(x => x.name === name);
    if (idx === -1) {
      throw new CommandError(`Challenge ${name} not found`);
    }
    return { name, ctf, idx, challenge: ctf.challenges[idx] };
  }

  private async boardList(url: string, listName: string) {
    const boardId = await Board.extractId(url);
    const list = await List.get(boardId, listName);
    if (!list) {
      throw new CommandError(
        `There is no \`${listName}\` list in the Trello board`
      );
    }
    return { boardId, list };
  }
}
