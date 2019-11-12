import { CmdCtx, Command, CommandGroup, Group } from "@/commands/definitions";
import { Challenge } from "@/db/entities/ctf";
import {
  boardList,
  getChallenge,
  getChallengeUser,
  getCTFTimeCTF
} from "@/services/ctf";
import { Board, Card, Label, randomTrelloColor } from "@/services/trello";

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
        const { boardId, list } = await boardList(ctf.url, "To Do");
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
        const { ctf, challenge } = await getChallenge(ctx);
        const user = await getChallengeUser(ctx, challenge, {
          workingOnByYou: false,
          alreadySolved: false
        });
        const { boardId, list: doing } = await boardList(
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
  @Command({
    desc: "Signal that you have solved a challenge",
    usage: "!solve <name>"
  })
  public async solve(ctx: CmdCtx) {
    await ctx
      .flow()

      .step("Getting info from db and Trello", async () => {
        const { ctf, challenge } = await getChallenge(ctx);
        const user = await getChallengeUser(ctx, challenge, {
          workingOnByYou: true,
          alreadySolved: false
        });
        const { list: done } = await boardList(ctf.trelloUrl, "Done");
        return { ctf, challenge, done, user };
      })

      .step(
        "Moving card and marking as solved",
        async ({ ctf, challenge, done, user }) => {
          await Card.move(challenge.cardId, done.id);
          challenge.solvedBy = user.id;
          await ctf.save();
        }
      )

      .run(
        async ({ challenge }) =>
          `<@${ctx.msg.author.id}> has solved \`${challenge.name}\` :tada:!`
      );
  }
}
