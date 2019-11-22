import fastify from "fastify";
import fastifyCookie from "fastify-cookie";
import cors from "fastify-cors";
import fastifySession from "fastify-session";
import staticServe from "fastify-static";
import { createReadStream } from "fs";
import { join } from "path";
import commands from "../commands";
import { config } from "../utils";
import oauth2 from "./oauth2";
import resources from "./resources";
import session, { SessionStore } from "./session";

const app = fastify({ logger: true });

const servePath = join(__dirname, "../../../webapp/build");

app.register(cors, {
  origin: "*"
});

app.register(staticServe, {
  root: servePath
});

app.register(fastifyCookie);
app.register(fastifySession, {
  secret: config("SERVER_SECRET"),
  cookie: {
    secure: false
  },
  saveUninitialized: false,
  store: new SessionStore<any>()
});

app.get("/api/health", async () => {
  return { OK: true };
});

app.get("/api/help", async () => {
  return Array.from(commands.commandMap.values()).map(x => ({
    name: x.name,
    usage: x.usage,
    desc: x.desc
  }));
});

// routes
app.register(resources);
app.register(session);
app.register(oauth2);

app.setNotFoundHandler((_, reply) => {
  reply
    .header("Content-Type", "text/html")
    .send(createReadStream(join(servePath, "index.html")));
});

// TODO use winston logger for this
export const setupServer = async () => {
  try {
    await app.listen(config("PORT"), "0.0.0.0");
  } catch (err) {
    app.log.error(err);
  }
};
