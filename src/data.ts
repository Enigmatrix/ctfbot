import {Connection, createConnection} from 'typeorm';
import { config } from './util';

export let initConnection = async() => {
    connection = await createConnection({
        type: "mongodb",
        url: config('MONGO_URI'),
        entities: [
            __dirname + '/entities/*.js'
        ]
    })}
;

export let connection: Connection;