import { Message, MessageReaction, TextChannel, User } from "discord.js";
import { Resource } from "../db/entities/resource";
import { info } from "../utils/message";
import bot from "../bot";

const resEmoji = "🗒️";
const resRmvEmoji = "❌";
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
  const resource = new Resource(msg, link);
  await resource.save();

  await msg.react(resEmoji);
  await msg.react(resRmvEmoji);
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
  if (!resource || !reaction.me || newUser.id === bot.user.id) {
    return;
  }
  if (reaction.emoji.name === resEmoji) {
    const formLink = `http://ctfbot.hats.sg/resource/${resource.id}`;
    await newUser.send(
      info(
        `Provide info for ${resource.link}`,
        `Use this form ${formLink} or the !res command (!res ${resource.link} category tag1,tag2..tagn desc)`
      )
    );
  } else if (
    reaction.emoji.name === resRmvEmoji &&
    resource.authorId === reaction.message.author.id
  ) {
    await resource.remove();
  }
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
