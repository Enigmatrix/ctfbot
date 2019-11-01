import fastify from "fastify";
import cors from "fastify-cors";
import { createReadStream } from "fs";
import { join } from "path";
import commands from "../commands";
// import { Resource } from "./entities/resource";
import { config } from "../utils";

const app = fastify({ logger: true });

app.register(cors, {
  origin: "*"
});

app.get("/health", async () => {
  return { OK: true };
});

app.get("/api/help", async () => {
  return Array.from(commands.commandMap.values()).map(x => ({
    name: x.name,
    usage: x.usage,
    desc: x.desc
  }));
});

app.setNotFoundHandler((_, reply) => {
  reply
    .header("Content-Type", "text/html")
    .send(createReadStream(join(__dirname, "./index.html")));
});

/*

app.get("/api/resources/categories", async (request, reply) => {
    return getMongoRepository(Resource).distinct("category", {});
});

app.get("/api/resources/by_category/:category", async (request, reply) => {
  return (await Resource.find({ category: request.params.category })).map((x) => {
    const { id, ...obj } = x;
    return obj;
  });
});

*/

// TODO use winston logger for this
export const setupServer = async () => {
  try {
    await app.listen(config("PORT"), "0.0.0.0");
  } catch (err) {
    app.log.error(err);
  }
};
