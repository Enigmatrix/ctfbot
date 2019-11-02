import { RichEmbed } from "discord.js";
import { CmdCtx } from "../commands/definitions";
import { Challenge, CTFTimeCTF } from "../db/entities/ctf";
import { User } from "../db/entities/user";
import { formatNiceSGT } from "../utils";
import { CommandError } from "../utils/message";
import { Board, List } from "./trello";

const NOT_CTF_CHANNEL = "This command is only valid in a CTF channel";
const NO_CREDS =
  "None. Use `!addcreds field1=value1 field2=value2` to add credentials";

async function getCTFTimeCTFFromId(
  chanid: string
): Promise<CTFTimeCTF | undefined> {
  return await CTFTimeCTF.findOne({
    discordChannelId: chanid,
    archived: false
  });
}

export async function getCTFTimeCTF(ctx: CmdCtx): Promise<CTFTimeCTF> {
  const ctf = await getCTFTimeCTFFromId(ctx.textChannel.id);
  if (!ctf) {
    throw new CommandError(NOT_CTF_CHANNEL);
  }
  return ctf;
}

export async function isInCtfChannel(ctx: CmdCtx): Promise<boolean> {
  return !!(await getCTFTimeCTFFromId(ctx.textChannel.id));
}

export async function getCtfMainEmbed(ctx: CmdCtx, ctf?: CTFTimeCTF) {
  if (!ctf) {
    ctf = await getCTFTimeCTF(ctx);
  }
  return await ctx.textChannel.fetchMessage(ctf.discordMainMessageId);
}

export function ctfMainEmbed(ctftimeEvent: CTFTimeCTF): RichEmbed {
  return new RichEmbed({
    color: 0x1e88e5,
    author: {
      name: `${ctftimeEvent.name} (${ctftimeEvent.format})`,
      icon_url: ctftimeEvent.logoUrl
    },
    description: ctftimeEvent.description,
    fields: [
      { name: "URL", value: ctftimeEvent.url },
      { name: "Trello", value: ctftimeEvent.trelloUrl },
      {
        name: "Timing",
        value:
          formatNiceSGT(ctftimeEvent.start) +
          " - " +
          formatNiceSGT(ctftimeEvent.finish)
      },
      {
        name: "Credentials",
        value:
          Object.keys(ctftimeEvent.credentials).length === 0
            ? NO_CREDS
            : Object.entries(ctftimeEvent.credentials)
                .map(([k, v]) => "```" + ` ${k} : ${v} ` + "```")
                .join("")
      }
    ],
    url: ctftimeEvent.url,
    footer: {
      text: `Hosted by ${ctftimeEvent.hosts.join(
        ", "
      )}. React with the 👌 emoji to get a DM 1hr before the CTF starts`
    }
  });
}

export async function getChallengeUser(
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
  } else if (!opts.workingOnByYou && idx !== -1) {
    throw new CommandError(
      "Seems like you are already working on this challenge..."
    );
  }
  if (opts.alreadySolved && !challenge.solvedBy) {
    throw new CommandError("Seems like the challenge is not already solved...");
  } else if (!opts.alreadySolved && challenge.solvedBy) {
    throw new CommandError("Seems like the challenge is already solved...");
  }
  return user;
}

export async function getChallenge(ctx: CmdCtx) {
  const [name] = ctx.args;
  const ctf = await getCTFTimeCTF(ctx);
  const idx = ctf.challenges.findIndex(x => x.name === name);
  if (idx === -1) {
    throw new CommandError(`Challenge ${name} not found`);
  }
  return { name, ctf, idx, challenge: ctf.challenges[idx] };
}

export async function boardList(url: string, listName: string) {
  const boardId = await Board.extractId(url);
  const list = await List.get(boardId, listName);
  if (!list) {
    throw new CommandError(
      `There is no \`${listName}\` list in the Trello board`
    );
  }
  return { boardId, list };
}
