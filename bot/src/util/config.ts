import {config} from "dotenv";

class Config {

  constructor() {
    config();
  }

  get(key: string) {
    // TODO split by debug and prod
    return process.env[key];
  }
}

export default new Config();