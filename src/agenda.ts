import Agenda from 'agenda';
import { config } from './util';
import bot from './bot';
import logger from './logger';
import { TextChannel, RichEmbed, ReactionCollector, MessageReaction, ReactionEmoji, Emoji } from 'discord.js';

const agenda =  new Agenda({db: {address: config("MONGO_URI")}});

agenda.define('notifyCtfReactorsv1.0', async (job, done) => {
    let {channelId, messageId, ctftimeEvent} = job.attrs.data;
    let channel = bot.channels.get(channelId) as TextChannel|undefined;
    if(!channel) { done(new Error(`Channel missing ${channelId}`)); return; }
    let message = await channel.fetchMessage(messageId);
    if(!message) { done(new Error(`Message missing ${messageId} in ${channelId}`)); return; }
    
    let reaction = await message.react('👌');
    let users = await reaction.fetchUsers();
    if(!reaction.me)
        await message.react('👌');
    
    for(let [id, user] of users){
        if(id === bot.user.id) continue;
        let dmChannel = await user.createDM();
        await dmChannel.send(new RichEmbed({
            color: 0xff6d00,
            author: {
                name: `Reminder for ${ctftimeEvent.title}`,
                icon_url: ctftimeEvent.logo === "" ? undefined : ctftimeEvent.logo
            },
            description: `This is a reminder that ${ctftimeEvent.title} starts in 1 hour. Good Luck!`,
            url: ctftimeEvent.url,
        }));
    }
});

export const NOTIFY_CTF_REACTORS = 'notifyCtfReactorsv1.0';
export default agenda.on('error', (e) => logger.error('Error from agenda', e));