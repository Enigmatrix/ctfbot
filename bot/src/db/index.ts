import { Connection, createConnection } from "typeorm";
import { config } from "../util/";

export async function initConnection(): Promise<void> {
  connection = await createConnection({
    type: "mongodb",
    url: config("MONGO_URI"),
    useUnifiedTopology: true,
    entities: [__dirname + "/entities/*.js", __dirname + "/entities/*.ts"]
  });
}

export let connection: Connection;
