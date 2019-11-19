import { ObjectId } from "bson";
import fastify from "fastify";
import cors from "fastify-cors";
import staticServe from "fastify-static";
import { createReadStream } from "fs";
import { join } from "path";
import { getMongoRepository, ObjectID } from "typeorm";
import { ResourceEditModel, ResourceModel } from "../../../shared/resource";
import commands from "../commands";
import { Resource } from "../db/entities/resource";
import { config } from "../utils";
import bot from "../bot";

const app = fastify({ logger: true });

const servePath = join(__dirname, "../../../webapp/build");

app.register(cors, {
  origin: "*"
});

app.register(staticServe, {
  root: servePath
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
    .send(createReadStream(join(servePath, "index.html")));
});

app.get("/api/resources/categories", async () => {
  return getMongoRepository(Resource).distinct("category", {});
});

app.get("/api/resources/by_category/:category", async (request, _) => {
  return (await Resource.find({ category: request.params.category })).map(
    toResourceModel
  );
});

app.get("/api/resources/:id", async (request, _) => {
  const id = request.params.id;
  return toResourceModel(await findResourceById(id));
});

app.post("/api/resources/:id", async (request, _) => {
  const id = request.params.id;
  const body = request.body;

  const resource = await findResourceById(id);
  if (body.link) {
    resource.link = body.link;
  }
  if (body.category) {
    resource.category = body.category;
  }
  if (body.description) {
    resource.description = body.description;
  }
  if (body.tags) {
    const tags = body.tags as string[];
    resource.tags = tags.filter((x, i, arr) => arr.indexOf(x) === i);
  }
  await resource.save();
  return { ok: true };
});

async function findResourceById(id: string): Promise<Resource> {
  // FIXME could throw error here too (invalid hex string/invalid length)
  const objId = ObjectId.createFromHexString(id);
  const resources = await Resource.findByIds([objId]);
  if (resources.length !== 1) {
    throw new Error(`No resource with id '${objId}' found`);
  }
  return resources[0];
}

function toResourceModel(res: Resource): ResourceModel | undefined {
  const author = bot.guilds.first().members.get(res.authorId);
  const channel = bot.guilds.first().channels.get(res.channelId);
  return {
    link: res.link,
    category: res.category,
    tags: res.tags,
    description: res.description,
    timestamp: res.timestamp,
    author: author ? author.nickname : undefined,
    channel: channel ? channel.name : undefined
  };
}

// TODO use winston logger for this
export const setupServer = async () => {
  try {
    await app.listen(config("PORT"), "0.0.0.0");
  } catch (err) {
    app.log.error(err);
  }
};
