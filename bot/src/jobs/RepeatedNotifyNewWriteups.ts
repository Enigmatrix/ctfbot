import { fetchChannelMessage } from "@/client";
import { CTFTimeCTF } from "@/data/entities/ctftimectf";
import { Job } from "@/jobs/base";
import ctftime, { Writeup } from "@/services/ctftime";
import { EMBED_INFO3 } from "@/util/embed";
import { MessageEmbed } from "discord.js";

class RepeatedNotifyNewWriteups extends Job<void> {
    ID: string = "repeated_notifyNewWriteupsv1.0";

    private prevNewestWriteupUrl: string | undefined;

    async run() {
      const writeups = await ctftime.recentWriteups();
      const newestWriteupUrl = writeups[0].url;
      if (this.prevNewestWriteupUrl === newestWriteupUrl) {
        return;
      }
      const ctfs = await CTFTimeCTF.find({ archived: false });
      const newWriteups: {[ctfUrl: string]: Writeup[] } = {};
      for(const writeup of writeups) {
        if(writeup.url === this.prevNewestWriteupUrl) {
          break;
        }
        if(!newWriteups[writeup.ctf.url]) {
          newWriteups[writeup.ctf.url] = [];
        }
        newWriteups[writeup.ctf.url].push(writeup);
      }

      for(const ctf of ctfs) {
        const writeups = newWriteups[ctf.info.url];
        if (!writeups) {
          continue;
        }
        const [channel, _] = await fetchChannelMessage(ctf.discord.channel, ctf.discord.mainMessage);
        for(const writeup of writeups) {
          if(!ctf.writeups[writeup.task.name]) {
            ctf.writeups[writeup.task.name] = [];
          }
          ctf.writeups[writeup.task.name].push(writeup);
          await channel.send(this.writeupEmbed(writeup));
        }
        await ctf.save();
      }

      this.prevNewestWriteupUrl = newestWriteupUrl;
    }
    writeupEmbed(writeup: Writeup) {
      return new MessageEmbed({
        color: EMBED_INFO3,
        author: {
          name: `New writeup for ${writeup.task.name} by ${writeup.author.name}`,
        },
        description: writeup.url,
        url: writeup.url
      });
    }
}

export default new RepeatedNotifyNewWriteups();
