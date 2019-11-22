import fastify from "fastify";
import cookie from "fastify-cookie";
import cors from "fastify-cors";
import session from "fastify-session";
import staticServe from "fastify-static";
import { createReadStream } from "fs";
import { join } from "path";
import commands from "../commands";
import { config } from "../utils";
import resources from './resources';
import SessionStore from './SessionStore';

const app = fastify({ logger: true });

const servePath = join(__dirname, "../../../webapp/build");

app.register(cors, {
  origin: "*"
});

app.register(staticServe, {
  root: servePath
});

app.register(cookie);

app.register(session, {
  secret: config("SERVER_SECRET"),
  cookie: {
    secure: false
  },
  saveUninitialized: false,
  store: new SessionStore<any>()
})

app.get('/debug', async (req) => {
  return req.session;
})

app.post('/debug', async (req) => {
  for (const k of Object.keys(req.body)) {
    req.session[k] = req.body;
  }
  return req.session;
})

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
