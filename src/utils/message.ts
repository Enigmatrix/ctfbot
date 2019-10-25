import {CmdCtx} from '../commands/definitions';
import {Message, MessageEmbed, RichEmbed} from 'discord.js';

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
    let [desc, func] = this.prevs[0];
    const msg = await this.ctx.msg.channel.send(this.embed(1, this.prevs.length, desc));
    let init = await func({});
    for (let i = 0; i < this.prevs.length; i++) {
      [desc, func] = this.prevs[i]
      let ginit = await func(init);
      for(let k in ginit) {
        init[k] = ginit[k];
      }
      (msg as Message).edit(this.embed(i+1, this.prevs.length, desc));
    }
    (msg as Message).edit("Done");
  }

  private embed(id: number, total: number, desc: string): RichEmbed {
    return new RichEmbed({ description: `${id}/${total} ${desc}`});
  }
}


