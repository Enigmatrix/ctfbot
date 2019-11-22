import OAuth2 from "client-oauth2";
import { User } from "discord.js";
import { FastifyInstance } from "fastify";
import { config } from "../utils";
import axios from "../utils/requests";
import bot from "../bot";

// TODO include state

export default function(app: FastifyInstance, _: any, done: () => void) {
  app.get("/api/login", async (req, reply) => {
    reply.redirect(
      createDiscordOAuth2(
        req.query.redirectUrl || config("SERVER_BASE")
      ).code.getUri()
    );
  });

  app.get("/api/login/callback", async (req, reply) => {
    if (!req.query.state) {
      throw new Error("OAuth2 state not found!");
    }
    const { oauth2, redirectUrl } = findDiscordOAuth2(req.query.state);
    let token = await oauth2.code.getToken(req.raw.url!);
    token = await token.refresh();
    const meReq = token.sign({
      method: "get",
      url: "https://discordapp.com/api/users/@me"
    });
    const user = await axios.request<User>(meReq).then(x => x.data);
    if (!bot.guilds.first().members.has(user.id)) {
      throw new Error("You must be a member of HATS SG first!");
    }
    req.session.discordInfo = user;
    reply.redirect(redirectUrl);
  });
  done();
}

// TODO move this to a class
const oath2states: Record<string, { oauth2: OAuth2; redirectUrl: string }> = {};

function findDiscordOAuth2(state: string) {
  const details = oath2states[state];
  delete oath2states[state];
  return details;
}

function createDiscordOAuth2(redirectUrl: string) {
  const state = generateRandomState();
  const oauth2 = new OAuth2({
    clientId: config("DISCORD_CLIENT_ID"),
    clientSecret: config("DISCORD_CLIENT_SECRET"),
    accessTokenUri: "https://discordapp.com/api/oauth2/token",
    authorizationUri: "https://discordapp.com/api/oauth2/authorize",
    redirectUri: "http://localhost:8080/api/login/callback",
    state,
    scopes: ["identify"]
  });

  oath2states[state] = { oauth2, redirectUrl };

  return oauth2;
}

function generateRandomState() {
  const rand = Math.floor(Math.random() * 10);
  let randStr = "";

  for (let i = 0; i < 20 + rand; i++) {
    randStr += String.fromCharCode(33 + Math.floor(Math.random() * 94));
  }

  return randStr;
}
