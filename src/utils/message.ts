import {CmdCtx} from '../commands/definitions';
import {Message} from 'discord.js';

export class Stop extends Error {
  // tslint:disable-next-line:variable-name
  protected __proto__: Error;
  constructor() {
    const trueProto = new.target.prototype;
    super();
    this.__proto__ = trueProto;
  }
}

// tslint:disable-next-line: max-classes-per-file
export class Flow<T> {

  private prevs: Array<[string, (a: any) => Promise<any>]>;
  private ctx: CmdCtx;

  constructor(ctx: CmdCtx, prevs: Array<[string, (a: any) => Promise<any>]>) {
    this.prevs = prevs;
    this.ctx = ctx;
  }

  public step<U>(desc: string, func: (a: T) => Promise<U>): Flow<U & T> {
    this.prevs.push([desc, func]);
    return new Flow<U & T>(this.ctx, this.prevs);
  }

  public async run() {
    let init = {};
    const msg = await this.ctx.msg.channel.send("Starting " + this.ctx.cmd.name)
    for (const [desc, func] of this.prevs) {
      init = func(init);
      (msg as Message).edit(desc);
    }
    (msg as Message).edit("Done");
  }
}


