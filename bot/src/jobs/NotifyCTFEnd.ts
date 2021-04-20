import { ObjectID } from "typeorm";
import { Job } from "@/jobs/base";
import { CTF } from "@/data/entities/ctf";
import client, { fetchChannelMessage } from "@/client";
import { MessageEmbed } from "discord.js";
import { EMBED_INFO1 } from "@/util/embed";

class NotifyCTFEnd extends Job<{ ctf_id: ObjectID }> {
    ID: string = "notifyCtfEndv1.0";

    async run(args: { ctf_id: ObjectID; }) {
        const ctf = await CTF.findOne(args.ctf_id);
        if(!ctf) {
            throw new Error(`CTF not found ${args.ctf_id}`);
        }
      
      const [channel, _] = await fetchChannelMessage(ctf.discord.channel, ctf.discord.mainMessage);

        await channel.send(new MessageEmbed({
          color: EMBED_INFO1,
          author: {
            name: `:tada: ${ctf.info.title} has ended! :tada:`,
            icon_url: ctf.info.logo
          },
          description: "Wanna play bad CTF Bingo while waiting for writeups? `!bingo` to start",
          url: ctf.info.url,
        }));
    }
}

export default new NotifyCTFEnd();
