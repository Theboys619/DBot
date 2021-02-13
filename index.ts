import { startBot } from "https://deno.land/x/discordeno/mod.ts";
import { config } from "./dotenv/mod.ts";
config();

import Commander from "./bot/commander.ts";
const commands = new Commander();
commands.setOverides({
  ready() {
    console.log("Bot Logged In");
  }
});

startBot({
  token: Deno.env.get("TOKEN") as string,
  intents: ["GUILDS", "GUILD_MESSAGES"],
  eventHandlers: commands.attach()
});