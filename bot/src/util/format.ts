import {DateTime} from "luxon";


export function formatSGT(d: DateTime|string) {
  if(typeof d === "string") {
    d = DateTime.fromISO(d as string);
  }
  return d.setZone("Asia/Singapore").toFormat("t EEE, d MMM");
}