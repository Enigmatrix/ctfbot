import { FastifyInstance } from "fastify";

export default function(app: FastifyInstance, _: any, done: () => void) {
  app.get("/", {})
  done();

}
