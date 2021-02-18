import { GuildChannel, GuildChannelResolvable, Message, TextChannel } from "discord.js";
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
    ["misc", "Misc commands"],
  ])
  .registerDefaultGroups()
  .registerDefaultCommands()
  .registerCommandsIn(path.join(__dirname, "./commands"));

client.once("ready", () => {
  log.info("logged in!", { id: client.user?.id, tag: client.user?.tag });
});

client.on("commandRun", (cmd, _, msg, args, fromPattern) => {
  log.debug("command executed", { cmd: cmd.name, msg: msg.id, args, fromPattern });
});

client.on("commandError", (cmd, err, msg, args, fromPattern) => {
  log.error("error in command", err, { cmd: cmd.name, msg: msg.id, args, fromPattern });
});

export async function fetchChannelMessage(channelFind: GuildChannelResolvable, messageFind: string): Promise<[TextChannel, Message]> {
  const guild = client.guilds.cache.first();
  const channel = guild?.channels.resolve(channelFind) as TextChannel|undefined;
  if(!channel) {
    throw new Error(`Channel ${channelFind} not found.`);
  }
  const message = await channel.messages.fetch(messageFind);
  if(!message) {
    throw new Error(`Message ${messageFind} not found.`);
  }
  return [channel, message];
}

export async function fetchChannel(channelFind: GuildChannelResolvable): Promise<GuildChannel> {
  const guild = client.guilds.cache.first();
  const channel = guild?.channels.resolve(channelFind) as TextChannel|undefined;
  if(!channel) {
    throw new Error(`Channel ${channelFind} not found.`);
  }
  return channel;
}

export async function findChannel(fn: (c: GuildChannel) => boolean): Promise<GuildChannel|undefined> {
  const guild = client.guilds.cache.first();
  const channel = guild?.channels.cache.find(fn);
  return channel;
}

export default client;