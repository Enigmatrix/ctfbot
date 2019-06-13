import fastify from "fastify";
import {initConnection} from './data';
import {Resource} from "./entities/resource";
import {config} from "./util";

const app = fastify({logger: true});

app.get("/api/resources/:category", async (request, reply) => {
    return (await Resource.find({category: request.params.category}))
        .map((x) => { const {id, ...obj} = x; return obj; });
});

// Run the server!
const setupServer = async () => {
  try {
    await app.listen(config("PORT"), '0.0.0.0');
  } catch (err) {
    app.log.error(err);
  }
};

(async () => {
    await initConnection();
    setupServer();
})();
