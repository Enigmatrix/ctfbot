import { RichEmbed } from "discord.js";
import { CmdCtx } from "../commands/definitions";
import { CTFTimeCTF } from "../db/entities/ctf";
import { formatNiceSGT } from "../utils";
import { CommandError } from "../utils/message";

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
