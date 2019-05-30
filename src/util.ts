import { MessageEmbed, RichEmbed, RichEmbedOptions } from "discord.js";
import moment from "moment-timezone";
import logger from "./logger";

export function config(key: string) {
    try {
        return process.env[key] || require("../config.json")[key];
    } catch (e) {
        logger.error(`Configuration '${key}' not found in Environment nor config.json file`);
        throw e;
    }
}
export function isUrl(s: string) {
    // tslint:disable-next-line:max-line-length
    return /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(s);
}

export function formatNiceSGT(date: Date) {
    return moment(date).tz("Asia/Singapore").format("DD MMM, h:mma") + " (SGT)";
}

export function limit(s: string, n: number) {
    return s.substr(0, n) + "...";
}

export function cloneEmbed(embed: MessageEmbed) {
    return Object.assign({}, embed) as unknown as RichEmbedOptions;
}

export function chooseRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

declare global {
    /*interface Object {
        ifNot<T>(this: T|undefined, fail: () => void): T;
    }*/

    // tslint:disable-next-line:interface-name
    interface Promise<T> {
        expect<T>(this: Promise<T|undefined>, fail: () => Promise<any>): Promise<T>;
        orElse<T>(this: Promise<T|undefined>, fail: () => Promise<T>): Promise<T>;
    }
}

export class ContinuationStop extends Error {
    // tslint:disable-next-line:variable-name
    protected __proto__: Error;
    constructor() {
        const trueProto = new.target.prototype;
        super();
        this.__proto__ = trueProto;
    }
}

export const ifNot = async (val: boolean, fail: () => Promise<any>) => {
    if (val) { return; }
    await fail();
    throw new ContinuationStop();
};

Promise.prototype.expect = async function<T>(this: Promise<T|undefined>, fail: () => Promise<any>): Promise<T> {
    const x = await this;
    if (!x) {
        await fail();
        throw new ContinuationStop();
    }
    return x;
};

Promise.prototype.orElse = async function<T>(this: Promise<T|undefined>, fail: () => Promise<T>): Promise<T> {
    const x = await this;
    if (!x) {
        return await fail();
    }
    return x;
};

export async function expect<T>(val: T|undefined, fail: () => Promise<any>): Promise<T> {
    if (!val) {
        await fail();
        throw new ContinuationStop();
    }
    return val;
}

export async function wait(num: number) : Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, num) );
}
