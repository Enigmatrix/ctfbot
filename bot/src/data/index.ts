import { Connection, createConnection } from "typeorm";
import config from "@/util/config";
import log from "@/util/logging";

export class Database {
    static instance: Database;

    static async init() {
        const conn = await createConnection({
            type: "mongodb",
            url: config.get("DATA_CONNECTION_URI"),
            entities: [__dirname + "/entities/*.js"]
        });
        log.info("connected to database");
        this.instance = new Database(conn);
    }

    constructor(conn: Connection) {
        this.conn = conn;
    }

    private conn: Connection;
}

export default Database.instance;