import "reflect-metadata";
import {Database as data} from "@/data";
import agenda from "@/jobs";
import client from "@/client";
import config from "@/util/config";

(async () => {
  await data.init();
  await client.login(config.get("DISCORD_TOKEN"));
  await agenda.start();
})();