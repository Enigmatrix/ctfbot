import { MessageEmbed, TextChannel } from "discord.js";
import { Job } from "@/jobs/base";
import ctftime, { Event } from "@/services/ctftime";
import { EMBED_INFO, EMBED_SUCCESS, EMBED_WARN } from "@/util/embed";
import { formatSGT } from "@/util/format";
import { DateTime } from "luxon";
import { fetchChannel } from "@/client";
import config from "@/util/config";

class RepeatedUpcoming extends Job<{ channel: string }|undefined> {
    ID = "repeated_upcomingv1.0";
    emptyCTFEmbed() {
      return new MessageEmbed({
        color: EMBED_WARN,
        title: "There are no upcoming online CTFs for this week",
      });
    }

    numberOfCTFsEmbed(len: number) {
      let numberOfCTFsText;
      if (len === 1) {
        numberOfCTFsText = "There is 1 upcoming online CTF for this week:";
      } else {
        numberOfCTFsText = `There are ${len} upcoming online CTFs for this week:`;
      }
      return new MessageEmbed({
        color: EMBED_SUCCESS,
        title: numberOfCTFsText,
      });
    }

    ctfEmbed(event: Event) {
      const addCtfText =
            `${event.ctftime_url}\nRun \`!addctf ${event.ctftime_url}\`` + "to add this CTF";
      return new MessageEmbed(
        {
          color: EMBED_INFO,
          author: {
            name: `${event.title} (${event.format}, ${event.restrictions
            })`,
            icon_url: event.logo === "" ? undefined : event.logo,
          },
          description: event.description,
          fields: [
            { name: "URL", value: !!event.url ? event.url : "Unknown event URL" },
            {
              name: "Timing",
              value: `${formatSGT(event.start)} - ${formatSGT(event.finish)}`,
            },
            { name: "CTFtime URL", value: addCtfText },
          ],
          url: event.url,
          footer: {
            text: `Hosted by ${event.organizers
              .map((x) => x.name)
              .join(", ")}.`,
          },
        });
    }

    async run(args: { channel: string }|undefined) {
      const start = DateTime.now();
      const end = start.plus({ weeks: 1 });

      const events = await ctftime.events(start, end);
      const ctfEmbeds = events
        .filter((x) => x.finish > x.start && !x.onsite)
        .map((x) => this.ctfEmbed(x));

      const channel = await fetchChannel(args?.channel || config.get("DISCORD_UPCOMING_CHANNEL")) as TextChannel;

      if (ctfEmbeds.length === 0) {
        await channel.send(this.emptyCTFEmbed());
      } else {

        await channel.send(this.numberOfCTFsEmbed(ctfEmbeds.length));

        for (const embed of ctfEmbeds) {
          await channel.send(embed);
        }
      }

    }
}

export default new RepeatedUpcoming();