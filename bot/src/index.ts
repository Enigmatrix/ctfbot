import {CommandoClient} from "discord.js-commando";
import path from "path";
import config from "@/util/config";

const client = new CommandoClient({
  commandPrefix: "!",
  owner: config.get("DISCORD_OWNER")
});

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ["ctf", "CTF channel management"],
    ["challenge", "Manage challenges in a CTF"],
  ])
  .registerDefaultGroups()
  .registerDefaultCommands()
  .registerCommandsIn(path.join(__dirname, "commands"));

client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag}! (${client.user?.id})`); // TODO log.success here
});


client.login(config.get("DISCORD_TOKEN"));