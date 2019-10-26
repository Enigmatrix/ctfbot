
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
