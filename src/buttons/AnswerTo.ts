import { ButtonInteraction, Client, MessageActionRow, Modal, TextInputComponent } from "discord.js";
import UserAnswer from "../models/UserAnswer";
import { sendHiddenReply } from "../tools/discord";

export default {
    name: 'answer_to',
    async execute(client: Client, interaction: ButtonInteraction) {
        if(await UserAnswer.userHasAlreadyAnswered(interaction.user.id, interaction.customId.split('=')[1])) {
            return sendHiddenReply(interaction, "Tu as déjà répondu à cette question");
        }

        const input = new TextInputComponent().setCustomId('answer_label').setLabel('Ta réponse').setRequired(true).setStyle('SHORT')
        // @ts-ignore
        const modal = new Modal().setCustomId(interaction.customId).setTitle('Réponds à la question').addComponents(new MessageActionRow().addComponents(input))
        return interaction.showModal(modal);
    }
}