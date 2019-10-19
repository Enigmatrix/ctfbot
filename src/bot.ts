import { Client } from "discord.js";
import log from "./utils/logger";

const bot = new Client();
bot.on("ready", () => {
    log.info("bot client up!");
});

bot.on("message", (msg) => {

});

export default bot;
