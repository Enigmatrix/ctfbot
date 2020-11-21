import Agenda from "agenda";
import {config} from "@/util";
import logger from "@/util/logger";

const agenda = new Agenda({ db: { address: config("MONGO_URI") } });

export default agenda.on("error", (e) => logger.error("Error from agenda", e));
