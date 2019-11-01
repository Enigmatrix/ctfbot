import { Challenge } from "../db/entities/ctf";
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
        const boardId = await Board.extractId(ctf.trelloUrl);
        const todo = await List.get(boardId, "To Do");
        if (!todo) {
          throw new CommandError(
            "There is no `To Do` list in the Trello board"
          );
        }
        return { ctf, todo, boardId };
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
}
