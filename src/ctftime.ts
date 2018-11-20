import axios from 'axios';
import logger from './logger';
export function isCtfTimeUrl(s: string){
    return /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?ctftime.org\/event\/([0-9])+(\/)?$/.test(s);
}

declare module CtfTime {

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
    const segments = ctftimeUrl.split('event/');
    let response = await axios.request<CtfTime.Event>({
        url: `https://ctftime.org/api/v1/events/${segments[segments.length-1]}`});
    return response.data;
};

export const weeklyCtftimeEvents = async () => {
    const start = Math.floor(Date.now()/1000);
    const finish = start + 24*7*60*60;
    let response = await axios.request<CtfTime.Event[]>({
        url: `https://ctftime.org/api/v1/events/`,
        params:{
            limit: 100,
            start, finish
        }
    });
    return response.data;
}