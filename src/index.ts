import bot from "./bot";
import {config} from "./utils/config";

(async () => {
    try {
        console.log("info");
        console.log(config("DISCORD_BOT_TOKEN"));
        await bot.login(config("DISCORD_BOT_TOKEN"));
        console.log("info");
    }
    catch (e) {
        console.error(e);
    }
})();
