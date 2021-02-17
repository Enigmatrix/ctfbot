import {config} from "dotenv";

class Config {

  constructor() {
    config();
  }

  get(key: string) {
    // TODO split by debug and prod
    const value = process.env[key];
    if (value === undefined) {
      throw new Error(`Config key ${key} not found`)
    }
    return value;
  }
}

export default new Config();