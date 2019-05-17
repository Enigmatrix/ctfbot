import Agenda, { Job } from "agenda";
import {
  Emoji,
  MessageReaction,
  ReactionCollector,
  ReactionEmoji,
  RichEmbed,
  TextChannel
} from "discord.js";
import { ObjectID } from "typeorm";
import bot from "./bot";
import { Ctf } from "./commands/ctf";
import { weeklyCtftimeEvents, getLatestWriteups } from "./ctftime";
import { CTFTimeCTF } from "./entities/ctf";
import logger from "./logger";
import { config, formatNiceSGT } from "./util";

const agenda = new Agenda({ db: { address: config("MONGO_URI") } });

export const NOTIFY_CTF_REACTORS = "notifyCtfReactorsv1.0";
export const REPEATED_NOTIFY_CTF_WRITEUPS = "repeated_notifyCtfWriteupsv1.0";
export const REPEATED_NOTIFY_UPCOMING_CTF = "repeated_notifyUpcomingCtfv1.0";

function defineJob(name: string, code: (job: Job) => Promise<void>) {
  agenda.define(name, async (job, done) => {
    let err;
    try {
      await code(job);
      logger.info(`Job '${name}' run successfully.`);
    } catch (e) {
      err = e;
      logger.error(`Job '${name}' failed:`);
      console,err(e);
    } finally {
      done(err);
    }
  });
}

defineJob(REPEATED_NOTIFY_CTF_WRITEUPS, async job => {
  const writeups = await getLatestWriteups();
  const ctfs = await CTFTimeCTF.find({ where: { archived: false } });

  for (const ctf of ctfs) {
    const num = ctf.ctftimeUrl.split(".org/event/")[1].split("/")[0];
    const shortUrl = `/event/${num}`;

    ctf.writeupLinks = ctf.writeupLinks || [];

    await Promise.all(
      writeups
        .filter(
          x => x.ctfUrl === shortUrl && ctf.writeupLinks.indexOf(x.url) === -1
        )
        .map(async x => {
          const embed = await Ctf.createCtfWriteupMessageEmbed(
            x.ctfTaskName,
            x.url
          );
          const channel = bot.guilds
            .first()
            .channels.get(ctf.discordChannelId) as TextChannel;
          await channel.sendEmbed(embed);

          ctf.writeupLinks.push(x.url);
        })
    );

    await ctf.save();
  }
});

defineJob(NOTIFY_CTF_REACTORS, async job => {
  const ctfid = (job.attrs.data.ctf as ObjectID).toString();
  const ctf = await CTFTimeCTF.findOne(ctfid, { where: { archived: false } });
  if (!ctf) {
    throw new Error(`CTF not found ${ctfid}`);
  }
  const message = await Ctf.getCtfMainMessageFromCtf(ctf);
  if (!message) {
    throw new Error(`Message missing for CTF ${ctfid}`);
  }

  const reaction = await message.react("👌");
  const users = await reaction.fetchUsers();
  if (!reaction.me) {
    await message.react("👌");
  }

  for (const [id, user] of users) {
    if (id === bot.user.id) {
      continue;
    }
    const dmChannel = await user.createDM();
    await dmChannel.send(
      new RichEmbed({
        color: 0xff6d00,
        author: {
          name: `Reminder for ${ctf.name}`,
          icon_url: ctf.logoUrl
        },
        description: `This is a reminder that ${
          ctf.name
        } starts in 1 hour. Good Luck!`,
        url: ctf.url
      })
    );
  }
});

defineJob(REPEATED_NOTIFY_UPCOMING_CTF, async job => {
  const channel = bot.guilds
    .first()
    .channels.find(x => x.name === "upcoming") as TextChannel;

  let ctftimeEvents = await weeklyCtftimeEvents();
  ctftimeEvents = ctftimeEvents.filter(x => x.finish > x.start && !x.onsite);
  if (ctftimeEvents.length === 0) {
    await channel.send(
      new RichEmbed({
        color: 0xff8f00,
        title: "There are no upcoming online CTFs for this week"
      })
    );
    return;
  }
  const eventNumberTitle =
    `There ${ctftimeEvents.length === 1 ? "is" : "are"} ${
      ctftimeEvents.length
    } ` +
    `upcoming online CTF${
      ctftimeEvents.length === 1 ? "" : "s"
    } for this week:`;
  await channel.send(
    new RichEmbed({
      color: 0x76ff03,
      title: eventNumberTitle
    })
  );
  for (const ctftimeEvent of ctftimeEvents) {
    const addCtfText =
      `${ctftimeEvent.ctftime_url}\nRun \`!addctf ${
        ctftimeEvent.ctftime_url
      }\`` + `to add this CTF`;
    await channel.send(
      new RichEmbed({
        color: 0x1e88e5,
        author: {
          name: `${ctftimeEvent.title} (${ctftimeEvent.format}, ${
            ctftimeEvent.restrictions
          })`,
          icon_url: ctftimeEvent.logo === "" ? undefined : ctftimeEvent.logo
        },
        description: ctftimeEvent.description,
        fields: [
          { name: "URL", value: ctftimeEvent.url },
          // tslint:disable-next-line:max-line-length
          {
            name: "Timing",
            value: `${formatNiceSGT(ctftimeEvent.start)} - ${formatNiceSGT(
              ctftimeEvent.finish
            )}`
          },
          { name: "CTFtime URL", value: addCtfText }
        ],
        url: ctftimeEvent.url,
        footer: {
          text: `Hosted by ${ctftimeEvent.organizers
            .map(x => x.name)
            .join(", ")}.`
        }
      })
    );
  }
});
agenda.on("ready", async () => {
  await agenda.purge(); /*
    let oldRepeatJobs = await agenda.jobs({name: {$regex: "repeated_.*"}});
    for(let job of oldRepeatJobs){
        await job.remove();
    }*/

  /*
    await agenda.create(REPEATED_NOTIFY_UPCOMING_CTF)
        .schedule('sunday at 6pm')
        .repeatEvery('1 week', { timezone: "Asia/Singapore", skipImmediate: true })
        .save();
    */

  await agenda.every("every 3 minutes", REPEATED_NOTIFY_CTF_WRITEUPS);
});

export default agenda.on("error", e => logger.error("Error from agenda", e));
