import { Message, RichEmbed } from "discord.js";
import logger from "../utils/logger";
import {
  CommandError,
  CommandFlowError,
  CommandStop,
  error,
  Flow
} from "../utils/message";

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
    throw new CommandError(err);
  }

  public flow(): Flow<{}> {
    return new Flow<{}>({ ctx: this, funcs: [] });
  }

  public async NotImplemented(args: CmdCtx) {
    args.msg.channel.send(
      new RichEmbed({
        title: ":exclamation: NotImplementedException has been thrown",
        color: 0xff0000
      })
    );
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

export abstract class CommandGroup {}

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

    const ctx = new CmdCtx(runArgs.args, runArgs.msg, command);
    try {
      await command.run(ctx);
    } catch (e) {
      if (e instanceof CommandFlowError) {
        await this.handleError(ctx, e.actualErr, e.editMsg);
      } else {
        await this.handleError(ctx, e);
      }
    }
  }

  private async handleError(ctx: CmdCtx, e: Error, editMsg?: Message) {
    if (e instanceof CommandStop) {
      return;
    }
    // TODO test this (throw fatal errors in flows and non-flows)
    let embed: RichEmbed;
    if (e instanceof CommandError) {
      embed = error(`Error in \`${ctx.cmd.name}\`:`, e.msg);
    } else {
      embed = error(
        `Unexpected error in \`${ctx.cmd.name}\`:`,
        "Check logs to debug or contact bot developers"
      );
    }

    if (editMsg) {
      await editMsg.edit(embed);
    } else {
      await ctx.msg.channel.send(embed);
    }

    if (e instanceof CommandError) {
      logger.warn(`${ctx.cmd.name}: ${e.msg}`);
    } else {
      logger.error(`Unexpected error in ${ctx.cmd.name}`);
      logger.error(e);
    }
  }
}

const commands = new CommandDefinitions();
export default commands;
