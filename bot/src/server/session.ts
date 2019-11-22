import { FastifyReply, FastifyRequest } from "fastify";
import {ServerResponse} from 'http';
import { Session } from "../db/entities/session";


export async function Authenticated(request: FastifyRequest, reply: FastifyReply<ServerResponse>) {
  if(!request.session.discordId) {
    // TODO redirect
  }
}

export class SessionStore<T> {
  public async set(
    sessionId: string,
    sessionDetails: T,
    callback: (err?: Error) => void
  ) {
    try {
      let session = await Session.findOne({ where: { sessionId } });
      if (!session) {
        session = new Session();
      }
      session.sessionId = sessionId;
      session.sessionDetails = sessionDetails;
      await session.save();
      callback();
    } catch (err) {
      callback(err);
    }
  }
  public async get(
    sessionId: string,
    callback: (err?: Error, obj?: T) => void
  ) {
    try {
      const session = await Session.findOne({ where: { sessionId } });
      if (!session) {
        callback(new Error(`Session not found for ${sessionId}`));
        return;
      }
      callback(undefined, session.sessionDetails as T);
    } catch (err) {
      callback(err);
    }
  }
  public async destroy(sessionId: string, callback: (err?: Error) => void) {
    try {
      const session = await Session.findOne({ where: { sessionId } });
      if (!session) {
        callback(new Error(`Session not found for ${sessionId}`));
        return;
      }
      await session.remove();
      callback();
    } catch (err) {
      callback(err);
    }
  }
}
