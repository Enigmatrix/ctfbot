import { Client } from 'discord.js';
import logger from './logger';
import commands from './commands/index';

const bot = new Client();
bot.on("ready", () => {
    logger.info('CTFBot Ready');
});

function splitter(str: string) {
    let splits = []
    let last = 0;
    let quote = false;
    let ws = false;
    for(let i = 0; i < str.length; i++){
        if(i+1 === str.length && !ws){
            splits.push([last, str.length]);
            continue
        }
        if(!/\S/.test(str[i]) && !quote){
            if(!ws){
                splits.push([last, i])
                ws = true;
            }
            last = i+1;
            continue;
        }
        ws = false;
        if(str[i] === "\"" && !eq(i-1, str, "\\\"")){
            if(!quote){
                last = i+1;
                quote = true;
            }
            else{
                splits.push([last, i]);
                last = i+1;
                quote = false;
                ws=true;
            }
            continue;
        }

    }
    return splits.map(x => str.substring(x[0], x[1]).replace("\\\"", "\""));
}

function eq(i: number, all: string, sub: string){
    if(i < 0 || i >= all.length || i+sub.length >= all.length)
        return false;
    return all.substr(i, sub.length) === sub;
}


bot.on('message', msg => {
    if(msg.content[0] !== "!" || msg.author.id === bot.user.id) return;

    let [cmd, ...args] = splitter(msg.content.substr(1));
    commands.run(cmd, { args, msg });
});

export default bot;