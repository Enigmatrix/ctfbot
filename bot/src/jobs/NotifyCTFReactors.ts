import { ObjectID } from "typeorm";
import { Job } from "@/jobs/base";
import { CTFTimeCTF } from "@/data/entities/ctftimectf";
import log from "@/util/logging";
import client, { fetchChannelMessage } from "@/client";
import { MessageEmbed, TextChannel } from "discord.js";
import { EMBED_INFO1 } from "@/util/embed";

class NotifyCTFReactors extends Job<{ ctf_id: ObjectID }> {
    ID: string = "notifyCtfReactorsv1.0";

    async run(args: { ctf_id: ObjectID; }) {
      const ctf = await CTFTimeCTF.findOne(args.ctf_id);
      if(!ctf) {
        throw new Error(`CTF not found ${args.ctf_id}`);
      }
      
      const [channel, mainMessage] = await fetchChannelMessage(ctf.discord.channel, ctf.discord.mainMessage);

      const thumbsup = mainMessage.reactions.resolve("👌");
      const users = await thumbsup!.users.fetch();

      for (const [id, user] of users) {
        if(client.user?.id === id) {
          continue;
        }

        const dm = await user.createDM();
        await dm.send(new MessageEmbed({
          color: EMBED_INFO1,
          author: {
            name: `Reminder for ${ctf.info.title}`,
            icon_url: ctf.info.logo
          },
          description: `This is a reminder that ${ctf.info.title} (${channel}) starts in 1 hour. Good Luck!`,
          url: ctf.info.url,
        }));
      }
    }
}

export default new NotifyCTFReactors();