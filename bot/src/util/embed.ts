import { CTFTimeCTF } from "@/data/entities/ctftimectf";
import { MessageEmbed } from "discord.js";
import { formatSGT } from "./format";

export const EMBED_SUCCESS = 0x00C851;
export const EMBED_SUCCESS2 = 0x007E33;
export const EMBED_INFO = 0x33b5e5;
export const EMBED_INFO1 = 0x0099CC;
export const EMBED_INFO2 = 0x4285F4;
export const EMBED_INFO3 = 0x0d47a1;
export const EMBED_WARN = 0xffbb33;
export const EMBED_WARN2 = 0xFF8800;
export const EMBED_ERROR = 0xff4444;
export const EMBED_ERROR2 = 0xcc0000;

export function mainMessageEmbed(ctf: CTFTimeCTF) {
    return new MessageEmbed({
      color: EMBED_INFO1,
      author: {
        name: `${ctf.info.title} (${ctf.info.format})`,
        icon_url: ctf.info.logo,
      },
      description: ctf.info.description,
      fields: [
        { name: "URL", value: ctf.info.url },
        //{ name: "Trello", value: ctftimeEvent.trelloUrl },
        { name: "Timing", value: `${formatSGT(ctf.info.start)} - ${formatSGT(ctf.info.finish)}` },
        { name: "Credentials", value:
          Object.keys(ctf.credentials).length === 0 ? "None. Use `!addcred key1 value1` to add credentials" :
            Object.entries(ctf.credentials)
              .map(([key, value]) => "```" + ` ${key}: ${value} ` + "```").join(""),
        }],
      url: ctf.info.url,
      footer: {
        text: `Hosted by ${ctf.info.organizers.map(x => x.name).join(", ")}. React with 👌 to get a DM 1hr before the CTF starts`,
      },
    });
  }