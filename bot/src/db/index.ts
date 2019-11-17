import { Connection, createConnection } from "typeorm";
import { config } from "../utils/";

export let initConnection = async () => {
  connection = await createConnection({
    type: "mongodb",
    url: config("MONGO_URI"),
    entities: [__dirname + "/entities/*.js", __dirname + "/entities/*.ts"]
  });
};

export let connection: Connection;
