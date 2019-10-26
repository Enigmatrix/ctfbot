import axios from '../utils/requests';

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

export async function eventFromUrl(ctftimeUrl: string): Promise<Event> {
  const segments = ctftimeUrl.split("event/");
  const last = segments[segments.length - 1];
  const response = await axios.get<Event>(`https://ctftime.org/api/v1/events/${last.split("/")[0]}/`);
  return response.data;
}
