import logger from "./logger";
import moment from 'moment-timezone';
import { RichEmbed, RichEmbedOptions, MessageEmbed } from "discord.js";

export function config(key: string): string{
    try{
        return process.env[key] || require('../config.json')[key];
    }
    catch(e){
        logger.error(`Configuration '${key}' not found in Environment nor config.json file`)
        throw e;
    }
}
export function isUrl(s: string){
    return /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(s)
}

export function formatNiceSGT(date: Date){
    return moment(date).tz('Asia/Singapore').format("DD MMM, h:mma") + ' (SGT)'
}

export function limit(s: string, n: number){
    return s.substr(0, n)+'...'
}

export function cloneEmbed(embed: MessageEmbed){
    return Object.assign({}, embed) as unknown as RichEmbedOptions;
}

export function chooseRandom<T>(arr: T[]): T{
    return arr[Math.floor(Math.random()*arr.length)];
}

declare global {
    /*interface Object {
        ifNot<T>(this: T|undefined, fail: () => void): T;
    }*/

    interface Promise<T> {
        expect<T>(this: Promise<T|undefined>, fail: () => void): Promise<T>;
    }
}

export class ContinuationStop extends Error {
    kind: string;
    constructor(){
        super();
        this.kind = "ContinuationStop";
    }
}

export const ifNot = async function(val: boolean, fail: () => void): Promise<void>{
    if(!val){
        fail();
        throw new ContinuationStop();
    }
}

Promise.prototype.expect = async function<T>(this: Promise<T|undefined>, fail: () => void): Promise<T> {
    const x = await this;
    if (!x) {
        fail();
        throw new ContinuationStop();
    }
    return x;
}

export function expect<T>(val: T|undefined, fail: ()=>void): T{
    if(!val){
        fail();
        throw new ContinuationStop();
    }
    return val;
}
