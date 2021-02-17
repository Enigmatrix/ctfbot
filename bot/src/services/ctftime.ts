import axios, { AxiosInstance } from "axios";
import * as cheerio from "cheerio";
import {DateTime} from "luxon";

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
  finish: string;
  description: string;
  weight: number;
  title: string;
  url: string;
  is_votable_now: boolean;
  restrictions: string;
  format: string;
  start: string;
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

export interface LinkRef {
  url: string,
  name: string
}

export interface Writeup {
  ctf: LinkRef,
  task: LinkRef,
  author: LinkRef,
  url: string
}

class CTFTime {
  static CTFTIME_URL = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?ctftime.org\/event\/(?<id>([0-9])+)(\/)?$/;

  private inner: AxiosInstance;

  constructor() {
    this.inner = axios.create({
      baseURL: "https://ctftime.org",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36"
      }
    });
  }

  isValidUrl(url: string) {
    return CTFTime.CTFTIME_URL.test(url);
  }

  async events(start: DateTime|Date|number, finish: DateTime|Date|number, limit: number|undefined = undefined) {
    return await this.inner.get<Event[]>("/api/v1/events/", { params: { start: +start, finish: +finish, limit } }).then(x => x.data);
  }

  async eventForUrl(url: string) {
    const id = url.match(CTFTime.CTFTIME_URL)?.groups?.id;
    return await this.inner.get<Event>(`/api/v1/events/${id}/`).then(x => x.data);
  }

  async recentWriteups(): Promise<Writeup[]> {
    function linkRef(n: any) {
      const e = $(n);
      const url = e.attr("href");
      if(!url) {
        throw new Error("a element does not have url");
      }
      const name = e.text();
      return { url: "https://ctftime.org" + url, name };
    }

    const webpage = await this.inner.get("/writeups").then(x => x.data);
    const $ = cheerio.load(webpage);
    const trs = $("#writeups_table > tbody > tr").toArray();
    const writeups = trs.map(tr => {
      const links = $(tr).find("td > a");
      return {
        ctf: linkRef(links[0]),
        task: linkRef(links[1]),
        author: linkRef(links[2]),
        url: linkRef(links[3]).url,
      };
    });
    return writeups;
  }
}

export default new CTFTime();