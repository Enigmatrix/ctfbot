import { Message, RichEmbed } from "discord.js";
import { CmdCtx } from "../commands/definitions";

export class CommandFlowError extends Error {
  public actualErr: Error;
  public editMsg: Message;
  // tslint:disable-next-line: variable-name
  protected __proto__: Error;
  constructor(e: Error, editMsg: Message) {
    const trueProto = new.target.prototype;
    super();
    this.__proto__ = trueProto;
    this.actualErr = e;
    this.editMsg = editMsg;
  }
}

export class CommandError extends Error {
  public msg: string;
  // tslint:disable-next-line: variable-name
  protected __proto__: Error;
  constructor(msg: string) {
    const trueProto = new.target.prototype;
    super();
    this.__proto__ = trueProto;
    this.msg = msg;
  }
}

export class CommandStop extends Error {
  // tslint:disable-next-line:variable-name
  protected __proto__: Error;
  constructor() {
    const trueProto = new.target.prototype;
    super();
    this.__proto__ = trueProto;
  }
}

export function info(title: string, description?: string): RichEmbed {
  return new RichEmbed({
    title,
    description,
    color: 0x17a2b8
  });
}

export function success(title: string, description?: string): RichEmbed {
  return new RichEmbed({
    title,
    description: description ? ":white_check_mark: " + description : undefined,
    color: 0x28a745
  });
}

export function warn(title: string, description?: string): RichEmbed {
  return new RichEmbed({
    title,
    description: description ? ":warn: " + description : undefined,
    color: 0xffc107
  });
}

export function error(title: string, description?: string): RichEmbed {
  return new RichEmbed({
    title,
    description: description ? ":x: " + description : undefined,
    color: 0xdc3545
  });
}

interface FlowState {
  funcs: Array<[string, (a: any) => Promise<any>]>;
  ctx: CmdCtx;
}

export class Flow<T> {
  private state: FlowState;

  constructor(state: FlowState) {
    this.state = state;
  }

  public step<U>(desc: string, func: (a: T) => Promise<U>): Flow<U & T> {
    this.state.funcs.push([desc, func]);
    return new Flow<U & T>(this.state);
  }

  public async run(endMsgFunc: (a: T) => Promise<string>) {
    const state = {};
    let [desc, func] = this.state.funcs[0];

    const msg = (await this.state.ctx.msg.channel.send(
      this.progress(1, desc)
    )) as Message;
    await this.runFunc(state, func, msg);

    for (let i = 1; i < this.state.funcs.length; i++) {
      [desc, func] = this.state.funcs[i];
      await msg.edit(this.progress(i + 1, desc));
      await this.runFunc(state, func, msg);
    }

    await msg.edit(success("Done!", await endMsgFunc(state as T)));
  }

  private async runFunc(
    state: any,
    func: (a: any) => Promise<any>,
    msg: Message
  ) {
    try {
      const temp = await func(state) || {};
      for (const k of Object.keys(temp)) {
        state[k] = temp[k];
      }
    } catch (e) {
      throw new CommandFlowError(e, msg);
    }
  }

  private progress(id: number, desc: string): RichEmbed {
    return info(
      `Running ${this.state.ctx.cmd.name} ...`,
      `\`[${id}/${this.state.funcs.length}]\` ${desc}`
    );
  }
}
