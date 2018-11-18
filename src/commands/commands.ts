import logger from '../logger';
import { Message } from 'discord.js';

declare type RunArgs = { args: string[], msg: Message };
declare type RunMethod = (a: RunArgs) => Promise<void>

export class Command {
    public name: string;
    public _description?: string;
    public _usage?: string;
    public run: RunMethod;

    constructor(name: string, run: RunMethod){
        this.name = name;
        this.run = run;
    }

    description(description: string){
        this._description = description;
        return this;
    }
    usage(usage: string){
        this._usage = usage;
        return this;
    }
}

export class Commands {
    private commandMap: Map<string, Command>;

    constructor(...cmds: Commands[]){
        this.commandMap = new Map<string, Command>();
        cmds.forEach(x => {
            this.merge(x);
        });
    }

    register(cmd: Command): Commands{
        this.commandMap.set(cmd.name, cmd);
        return this;
    }

    merge(other: Commands){
        other.commandMap.forEach(cmd => {
            this.register(cmd);
        });
        return this;
    }

    run(name: string, runArgs: RunArgs){
        let command = this.commandMap.get(name);
        if(!command){
            logger.warn(`Unrecognized command: ${name} (${runArgs.msg.content})`);
            return;
        }
        logger.info(`Running command ${name} (${runArgs.msg.content})`);
        command.run(runArgs)
            .catch(e => logger.error(`Unexpected error while running ${name}`, e));
    }
}