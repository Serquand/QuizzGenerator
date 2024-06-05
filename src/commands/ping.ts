import { Client, CommandInteraction } from "discord.js";

export default {
    name: 'ping',
    description: 'Respond with Pong !',
    runSlash: (client: Client, interaction: CommandInteraction) => {
        interaction.reply('Pong !');
    }
}