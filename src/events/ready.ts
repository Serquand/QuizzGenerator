import { Client } from "discord.js";
import { commands } from "../tools/handlers";

export default {
    name: 'ready',
    once: true,
    execute(client: Client) {
        client.guilds.cache.forEach(guild => {
            guild.commands.set(commands.map((cmd) => cmd) as any);
        });
        console.log('Bot launched !');
    }
}