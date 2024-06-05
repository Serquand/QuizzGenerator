// @ts-nocheck
import { Client, Interaction } from "discord.js";
import { buttonResponseMethods, commands, modalResponseMethods } from "../tools/handlers";
import { sendHiddenReply } from "../tools/discord";

export default {
    name: 'interactionCreate',
    once: false,
    execute(client: Client, interaction: Interaction) {
        if(interaction.isCommand()) {
            const cmd = commands.get(interaction.commandName) as any;
            if(!cmd) return interaction.reply({ content: "Cette commande n'existe pas", ephemeral: true });
            cmd.runSlash(client, interaction);
        }

        if(interaction.isButton() && interaction.message.author.client === client) {
            const responseMethod = buttonResponseMethods.get(interaction.customId.split('=')[0]);
            if(!responseMethod) return sendHiddenReply(interaction, "Error : Response to button not found !");
            responseMethod.execute(client, interaction);
        }

        if(interaction.isAutocomplete()) {
            const command = commands.get(interaction.commandName);
            try {
                if (!command) throw new Error(`No command matching ${interaction.commandName} was found.`);
                command.autocomplete(interaction);
            } catch (error) {
                console.error(error);
            }
        }

        if(interaction.isModalSubmit()) {
            const responseMethod = modalResponseMethods.get(interaction.customId.split('=')[0]);
            if(!responseMethod) return sendHiddenReply(interaction, "Error : Response to modal not found !");
            responseMethod.execute(client, interaction);
        }
    }
}