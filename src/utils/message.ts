import {Message, RichEmbed} from 'discord.js';
import {CmdCtx} from '../commands/definitions';

export class Stop extends Error {
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
        description,
        color: 0x28a745
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

  public async run(endMsg?: string) {
    let [desc, func] = this.state.funcs[0];
    const msg = await this.state.ctx.msg.channel.send(
        this.progress(1, desc)) as Message;
    const state = await func({});
    for (let i = 0; i < this.state.funcs.length; i++) {
      [desc, func] = this.state.funcs[i]
      const temp = await func(state);
      for(const k of Object.keys(temp)) {
        state[k] = temp[k];
      }
      await msg.edit(this.progress(i+1, desc));
    }
    await msg.edit(success("Done!", endMsg));
  }

  private progress(id: number, desc: string): RichEmbed {
    return info(`Running ${this.state.ctx.cmd.name} ...`,
                `\`[${id}/${this.state.funcs.length}]\` ${desc}`);
  }
}


