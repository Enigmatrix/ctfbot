import log from "./logger";

export function config(key: string) {
    try {
        return process.env[key] || require("../../config.json")[key];
    } catch (e) {
        log.error(`Configuration '${key}' not found in Environment nor config.json file`);
        throw e;
    }
}
