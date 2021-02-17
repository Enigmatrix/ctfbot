import ctftime from "@/services/ctftime";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";

export default class Test extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "test",
      group: "misc",
      memberName: "test",
      description: "Primary test command",
    });
  }

  async run(message: CommandoMessage, args: string) {
    console.log(await ctftime.recentWriteups());
    return null;
  }
}
