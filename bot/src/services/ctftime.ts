import axios, { AxiosInstance } from "axios";
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

class CTFTime {
    private inner: AxiosInstance;

    constructor() {
      this.inner = axios.create({
        baseURL: "https://ctftime.org/api/v1",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36"
        }
      });
    }

    async events(start: DateTime|Date|number, finish: DateTime|Date|number, limit: number|undefined = undefined) {
      return await this.inner.get<Event[]>("/events/", { params: { start: +start, finish: +finish, limit } }).then(x => x.data);
    }
}

export default new CTFTime();