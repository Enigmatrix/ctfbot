import axios from "axios-https-proxy-fix";
import logger from "./logger";
import Parser from 'rss-parser';
import cheerio from 'cheerio';

//axios.defaults.headers.common['User-Agent'] = "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19";
axios.defaults.headers.common['User-Agent'] = "";

/*axios.defaults.proxy = {
    host: "35.167.149.29",
    port: 3128,
};*/

export function isCtfTimeUrl(s: string) {
    return /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?ctftime.org\/event\/([0-9])+(\/)?$/.test(s);
}

export declare namespace CtfTime {

    export interface Organizer {
        id: number;
        name: string;
    }

    export interface Duration {
        hours: number;
        days: number;
    }

    export interface Event {
        organizers: Organizer[];
        onsite: boolean;
        finish: Date;
        description: string;
        weight: number;
        title: string;
        url: string;
        is_votable_now: boolean;
        restrictions: string;
        format: string;
        start: Date;
        participants: number;
        ctftime_url: string;
        location: string;
        live_feed: string;
        public_votable: boolean;
        duration: Duration;
        logo: string;
        format_id: number;
        id: number;
        ctf_id: number;
    }

}

export const getCtftimeEvent = async (ctftimeUrl: string) => {
    const segments = ctftimeUrl.split("event/");
    const last = segments[segments.length - 1];
    const response = await axios.get<CtfTime.Event>(`https://ctftime.org/api/v1/events/${last.split("/")[0]}/`);
    return response.data;
};

export const weeklyCtftimeEvents = async () => {
    const start = Math.floor(Date.now() / 1000);
    const finish = start + 7 * 24 * 60 * 60;
    const response = await axios.get<CtfTime.Event[]>(`https://ctftime.org/api/v1/events/`, {
        params: {
            limit: 100,
            start,
            finish,
        },
    });
    return response.data;
};

const parser = new Parser();

const getWriteupLinks = async () => {
  const url = "https://ctftime.org/writeups/rss/";
  let feed = await parser.parseURL(url);
  if(!feed.items) return <string[]>[];
    return <string[]>feed.items.map(x => x.link);
}

const download = async (uri: string): Promise<string> => {
  try{
      return await axios.get(uri, {}).then(x => x.data);
  }
  catch{
    //console.log('Retrying ', uri, ' ..');
    return download(uri);
  }
}

const getWriteupInfo = async (url: string) => {
  let $ = await cheerio.load(await download(url));
  let ctfUrl = $(".breadcrumb > li:nth-child(3) > a").attr('href');
  let ctfTask = $(".breadcrumb > li:nth-child(6) > a");
  let ctfTaskUrl = ctfTask.attr('href');
  let ctfTaskName = ctfTask.text();
  return { ctfUrl, ctfTaskUrl, ctfTaskName, url };
}

export const getLatestWriteups = async () => {
  let writeupLinks = await getWriteupLinks();
  return await Promise.all(writeupLinks.map(x => getWriteupInfo(x)));
}
