import { Resource } from "@/db/entities/resource";
import { info } from "@/utils/message";
import { Message, MessageReaction, TextChannel, User } from "discord.js";

const resEmoji = "❓";
const urlregex = /(?:https?:\/\/(?:www\.)?|www\.)[a-z0-9]+(?:[-.][a-z0-9]+)*\.[a-z]{2,5}(?::[0-9]{1,5})?(?:\/\S*)?/gm;

export function hasResourceLink(msg: Message): boolean {
  return isInInterestLabChannel(msg) && urlregex.test(msg.content);
}

export async function createResource(msg: Message) {
  const link = getResourceLink(msg.content);
  if (!link) {
    return;
  }
  const existing = await Resource.findOne({ where: { link } });
  if (existing) {
    await msg.reply(
      `${link} has already been posted by <@${existing.authorId}> in <#${existing.channelId}>`
    );
    return;
  }
  const resource = new Resource();
  resource.authorId = msg.author.id;
  resource.channelId = msg.channel.id;
  resource.msgId = msg.id;
  resource.link = link;
  resource.tags = [];
  resource.category = (msg.channel as TextChannel).name;
  resource.timestamp = new Date();
  resource.description = "";
  await resource.save();

  await msg.react(resEmoji);
}

export async function resourceAuthorReaction(
  reaction: MessageReaction,
  newUser: User
) {
  const resource = await Resource.findOne({
    where: {
      msgId: reaction.message.id,
      channelId: reaction.message.channel.id
    }
  });
  if (!resource || !reaction.me || reaction.emoji.name !== resEmoji) {
    return;
  }
  const dm = await newUser.createDM();
  await dm.send(info(`Provide info for ${resource.link}: //TODO`));
}

function isInInterestLabChannel(msg: Message): boolean {
  return (msg.channel as TextChannel).parent.name === "Interest Labs";
}

function getResourceLink(s: string) {
  const match = s.match(urlregex);
  if (match) {
    return match[0];
  }
}
