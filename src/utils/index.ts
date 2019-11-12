import log from "@/utils/logger";
import moment from "moment-timezone";

export function config(key: string) {
  try {
    return process.env[key] || require("../../config.json")[key];
  } catch (e) {
    log.error(
      `Configuration '${key}' not found in Environment nor config.json file`
    );
    throw e;
  }
}


export function isCTFTimeUrl(s: string) {
  // tslint:disable-next-line:max-line-length
  return /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?ctftime.org\/event\/([0-9])+(\/)?$/.test(
    s
  );
}

export function formatNiceSGT(date: Date) {
  return (
    moment(date)
      .tz("Asia/Singapore")
      .format("DD MMM, h:mma") + " (SGT)"
  );
}

export async function wait(num: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, num));
}

export function limit(s: string, n: number) {
  return s.substr(0, n) + "...";
}

export function chooseRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
