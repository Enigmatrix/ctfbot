export function developMode(): boolean {
  return (process.env.NODE_ENV || "dev") === "dev";
}

function _config(key: string): string|undefined {
  return process.env[key];
}

export function config(key: string): string {
  const value = (
    _config(key) ||
    _config(key + (developMode() ? "_DEVELOPMENT" : "_PRODUCTION"))
  );
  if (!value) { 
   throw Error(`Configuration '${key}' not found in Environment nor .env file`);
  }
  return value;
}
