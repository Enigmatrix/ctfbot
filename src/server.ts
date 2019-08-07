import fastify from "fastify";
import cors from "fastify-cors";
import { getMongoRepository } from "typeorm";
import { initConnection } from "./data";
import { Resource } from "./entities/resource";
import { config } from "./util";

const app = fastify({ logger: true });

app.register(cors, {
  origin: "*",
});

app.get("/health", async (request, reply) => {
    return { OK: true };
});

app.get("/api/resources/categories", async (request, reply) => {
    return getMongoRepository(Resource).distinct("category", {});
});

app.get("/api/resources/by_category/:category", async (request, reply) => {
  return (await Resource.find({ category: request.params.category })).map((x) => {
    const { id, ...obj } = x;
    return obj;
  });
});

export const setupServer = async () => {
  try {
    await app.listen(config("PORT"), "0.0.0.0");
  } catch (err) {
    app.log.error(err);
  }
};
