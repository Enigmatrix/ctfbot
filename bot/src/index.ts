import {CommandoClient} from "discord.js-commando";
import path from "path";
import config from "@/util/config";
import log from "@/util/logging";

const client = new CommandoClient({
  commandPrefix: "!",
  owner: config.get("DISCORD_OWNER")
});

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ["ctf", "CTF Channel management"],
  ])
  .registerDefaultGroups()
  .registerDefaultCommands()
  .registerCommandsIn(path.join(__dirname, "commands"));

client.once("ready", () => {
  log.info(`logged in!`, { id: client.user?.id, tag: client.user?.tag });
});

client.on('commandRun', (cmd, _, msg, args, fromPattern) => {
  log.debug("command executed", { cmd: cmd.name, msg: msg.id, args, fromPattern });
});

client.on('commandError', (cmd, err, msg, args, fromPattern) => {
  log.error("error in command", err, { cmd: cmd.name, msg: msg.id, args, fromPattern });
});


client.login(config.get("DISCORD_TOKEN"));