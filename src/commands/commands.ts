import logger from '../logger';
import { Message, RichEmbed } from 'discord.js';
import { ContinuationStop } from '../util';

export declare type RunArgs = { args: string[], msg: Message };
export declare type CmdRunArgs = { args: string[], msg: Message, cmd: CommandRegistration };
export declare type RunMethod = (a: CmdRunArgs) => Promise<void>

export class CommandRegistration {
    public name: string;
    public description?: string;
    public usage: string;
    public run: RunMethod;

    constructor(name: string, run: RunMethod, desc?: string, usage?: string){
        this.name = name;
        this.run = run;
        this.usage = usage || "!"+name
        this.description = desc;
    }
}

export function Group(name: string){
    return (obj: any) => {
        
    }
}

export function Command(cmd: {name?: string, desc?: string, usage?: string}) {
    return (obj: CommandGroup, name: string, descriptor: PropertyDescriptor) => {
        
        commands.register(new CommandRegistration(cmd.name || name, descriptor.value as RunMethod, cmd.desc, cmd.usage));
    }
}

export class CommandGroup {
    async NotImplemented(args: CmdRunArgs){
        args.msg.channel.send(new RichEmbed({
            title: ':exclamation: NotImplementedException has been thrown',
            color: 0xff0000
        }));
    }
}

export class CommandRegistrations {
    public commandMap: Map<string, CommandRegistration>;

    constructor(){
        this.commandMap = new Map<string, CommandRegistration>();
    }

    register(cmd: CommandRegistration): CommandRegistrations {
        this.commandMap.set(cmd.name, cmd);
        return this;
    }

    run(name: string, runArgs: RunArgs){
        let command = this.commandMap.get(name);
        if(!command){
            logger.warn(`Unrecognized command: ${name} (${runArgs.msg.content})`);
            return;
        }
        logger.info(`Running command ${name} (${runArgs.msg.content})`);
        command.run({cmd: command, ...runArgs})
            .catch(e => {
                if(e instanceof ContinuationStop)
                    return;
                logger.error(`Unexpected error while running ${name}`, e);
                console.error(e);
            });
    }
}

const commands = new CommandRegistrations();
export default commands;