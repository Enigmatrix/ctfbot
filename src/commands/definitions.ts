import { Message, RichEmbed } from "discord.js";
import logger from "../utils/logger";
import { CommandError, CommandStop, error, Flow } from "../utils/message";

export function Group(name: string) {
  return <T extends new (...args: any[]) => {}>(ctor: T) => {
    return class extends ctor {
      public name = name;
    };
  };
}

export function Command(cmd: { name?: string; desc?: string; usage?: string }) {
  return (grp: CommandGroup, name: string, descriptor: PropertyDescriptor) => {
    commands.register(
      new CommandDefinition(
        cmd.name || name,
        descriptor.value as RunMethod,
        grp,
        cmd.desc,
        cmd.usage
      )
    );
  };
}

export declare interface RunArgs {
  args: string[];
  msg: Message;
}

export class CmdCtx {
  public args: string[];
  public msg: Message;
  public cmd: CommandDefinition;
  constructor(rawArgs: string[], msg: Message, cmd: CommandDefinition) {
    this.args = rawArgs;
    this.msg = msg;
    this.cmd = cmd;
  }

  public async printUsage() {
    await this.msg.channel.send(this.cmd.usage);
  }

  public async error(err: string): Promise<never> {
    logger.warn(`Error in ${this.cmd.name}: ${err}`);
    throw new CommandError(err);
  }

  public flow(): Flow<{}> {
    return new Flow<{}>({ ctx: this, funcs: [] });
  }
}

export declare type RunMethod = (a: CmdCtx) => Promise<void>;

export class CommandDefinition {
  public name: string;
  public desc?: string;
  public usage: string;
  public run: RunMethod;
  public grp: CommandGroup;

  constructor(
    name: string,
    run: RunMethod,
    grp: CommandGroup,
    desc?: string,
    usage?: string
  ) {
    this.name = name;
    this.run = run;
    this.usage = "Usage: " + (usage || "!" + name);
    this.desc = desc;
    this.grp = grp;
  }
}

export class CommandGroup {
  public async NotImplemented(args: CmdCtx) {
    args.msg.channel.send(
      new RichEmbed({
        title: ":exclamation: NotImplementedException has been thrown",
        color: 0xff0000
      })
    );
  }
}

export class CommandDefinitions {
  public commandMap: Map<string, CommandDefinition>;

  constructor() {
    this.commandMap = new Map<string, CommandDefinition>();
  }

  public register(cmd: CommandDefinition): CommandDefinitions {
    this.commandMap.set(cmd.name, cmd);
    return this;
  }

  public async run(name: string, runArgs: RunArgs) {
    const command = this.commandMap.get(name);
    if (!command) {
      logger.warn(`Unrecognized command: ${name} (${runArgs.msg.content})`);
      return;
    }
    logger.info(`Running command ${name} (${runArgs.msg.content})`);

    try {
      await command.run(new CmdCtx(runArgs.args, runArgs.msg, command));
    } catch (e) {
      if (e instanceof CommandStop) {
        return;
      }
      if (e instanceof CommandError) {
        await runArgs.msg.channel.send(error(`Error in \`${name}\`:`, e.msg));
        return;
      }
      logger.error(`Unexpected error while running ${name}`);
      logger.error(e);
    }
  }
}

const commands = new CommandDefinitions();
export default commands;
