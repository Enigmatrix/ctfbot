import fastify from "fastify";
import {Resource} from "./entities/resource";
import {config} from "./util";

const app = fastify({logger: true});

app.get("/api/resources/:category", async (request, reply) => {
    return (await Resource.find({category: request.params.category}))
        .map((x) => { const {id, ...obj} = x; return obj; });
});

// Run the server!
export const setupServer = async () => {
  try {
    await app.listen(config("PORT"));
  } catch (err) {
    app.log.error(err);
  }
};
