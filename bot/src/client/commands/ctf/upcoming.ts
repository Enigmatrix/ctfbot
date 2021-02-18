import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import RepeatedUpcoming from "@/jobs/RepeatedUpcoming";

export default class Upcoming extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: "upcoming",
      group: "ctf",
      memberName: "upcoming",
      description: "Fetches upcoming CTFs for the next 7 days",
    });
  }

  async run(message: CommandoMessage) {
    await RepeatedUpcoming.schedule("now", { channel: message.channel.id });
    return null;
  }
}