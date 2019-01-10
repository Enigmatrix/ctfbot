import { Message, RichEmbed } from "discord.js";
import logger from "../logger";
import { ContinuationStop } from "../util";

export declare interface RunArgs { args: string[]; msg: Message; }
export class CmdRunArgs {
    public rawArgs: string[];
    public msg: Message;
    public cmd: CommandRegistration;
    constructor(rawArgs: string[], msg: Message, cmd: CommandRegistration) {
        this.rawArgs = rawArgs;
        this.msg = msg;
        this.cmd = cmd;
    }

    public checkedArgs(len: number): string[] {
        if (len !== this.rawArgs.length) {
            this.printUsage();
            throw new ContinuationStop();
        }
        return this.rawArgs;
    }

    public async printUsage() {
        await this.msg.channel.send(this.cmd.usage);
    }
}
export declare type RunMethod = (a: CmdRunArgs) => Promise<void>;

// tslint:disable-next-line:max-classes-per-file
export class CommandRegistration {
    public name: string;
    public description?: string;
    public usage: string;
    public run: RunMethod;

    constructor(name: string, run: RunMethod, desc?: string, usage?: string) {
        this.name = name;
        this.run = run;
        this.usage = "Usage: " + (usage || "!" + name);
        this.description = desc;
    }
}

export function Group(name: string) {
    return (obj: any) => { /* TODO */ };
}

export function Command(cmd: {name?: string, desc?: string, usage?: string}) {
    return (obj: CommandGroup, name: string, descriptor: PropertyDescriptor) => {

        commands.register(new CommandRegistration(
            cmd.name || name, descriptor.value as RunMethod, cmd.desc, cmd.usage));
    };
}

// tslint:disable-next-line:max-classes-per-file
export class CommandGroup {
    public async NotImplemented(args: CmdRunArgs) {
        args.msg.channel.send(new RichEmbed({
            title: ":exclamation: NotImplementedException has been thrown",
            color: 0xff0000,
        }));
    }
}

// tslint:disable-next-line:max-classes-per-file
export class CommandRegistrations {
    public commandMap: Map<string, CommandRegistration>;

    constructor() {
        this.commandMap = new Map<string, CommandRegistration>();
    }

    public register(cmd: CommandRegistration): CommandRegistrations {
        this.commandMap.set(cmd.name, cmd);
        return this;
    }

    public run(name: string, runArgs: RunArgs) {
        const command = this.commandMap.get(name);
        if (!command) {
            logger.warn(`Unrecognized command: ${name} (${runArgs.msg.content})`);
            return;
        }
        logger.info(`Running command ${name} (${runArgs.msg.content})`);
        command.run(new CmdRunArgs(runArgs.args, runArgs.msg, command))
            .catch((e: Error) => {
                if (e instanceof ContinuationStop) {
                    return;
                }
                logger.error(`Unexpected error while running ${name}`);
                // tslint:disable-next-line:no-console
                console.error(e);
            });
    }
}

const commands = new CommandRegistrations();
export default commands;
