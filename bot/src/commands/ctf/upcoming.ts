import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import ctftime, { Event } from "../../services/ctftime";
import { DateTime } from "luxon";
import { MessageEmbed } from "discord.js";
import { formatSGT } from "../../util/format";
import { EMBED_INFO, EMBED_SUCCESS, EMBED_WARN } from "../../util/embed";

export default class Upcoming extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'upcoming',
            group: 'ctf',
            memberName: 'upcoming',
            description: 'Fetches upcoming CTFs for the next 7 days',
        });
    }

    emptyCTFEmbed() {
        return new MessageEmbed({
            color: EMBED_WARN,
            title: "There are no upcoming online CTFs for this week",
        });
    }

    numberOfCTFsEmbed(len: number) {
        let numberOfCTFsText;
        if (len === 1) {
            numberOfCTFsText = `There is 1 upcoming online CTF for this week:`;
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
            `${event.ctftime_url}\nRun \`!addctf ${event.ctftime_url}\`` + `to add this CTF`;
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
                    { name: "URL", value: event.url },
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

    async run(message: CommandoMessage) {
        const start = DateTime.now();
        const end = start.plus({ weeks: 1 });

        const events = await ctftime.events(start, end);
        const ctfEmbeds = events
            .filter((x) => x.finish > x.start && !x.onsite)
            .map((x) => this.ctfEmbed(x));

        if (ctfEmbeds.length === 0) {
            await message.embed(this.emptyCTFEmbed());
        } else {

            await message.embed(this.numberOfCTFsEmbed(ctfEmbeds.length));

            for (const embed of ctfEmbeds) {
                await message.embed(embed);
            }
        }

        return null;
    }
}