import mapping from "../../../config.json";

export function developMode(): boolean {
  return (process.env.NODE_ENV || "dev") === "dev";
}

function _config(key: string) {
  return process.env[key] || (<Record<string, string>>mapping)[key];
}

export function config(key: string): string {
  try {
    return (
      _config(key) ||
      _config(key + (developMode() ? "_DEVELOPMENT" : "_PRODUCTION"))
    );
  } catch (e) {
    /* log.error(
      `Configuration '${key}' not found in Environment nor config.json file`
    ); */
    throw e;
  }
}
