import logger from "./logger";
import moment from 'moment-timezone';

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
    return moment(date).tz('Asia/Singapore').format("MMMM Do, h:mm:ss a") + ' (SGT)'
}

export function limit(s: string, n: number){
    return s.substr(0, n)+'...'
}