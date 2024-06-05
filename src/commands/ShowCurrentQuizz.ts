import { Client, CommandInteraction } from "discord.js";
import Quizz from "../models/Quizz";
import { sendHiddenReply } from "../tools/discord";
import { generateQuizzEmbed } from "../tools/Quizz";

export default {
    name: 'show_current_quizz',
    description: "Show the current and incoming quizz",
    runSlash: async (client: Client, interaction: CommandInteraction) => {
        const allQuizzToDisplay = await Quizz.getAllIncomingOrRunningQuizz(interaction.guildId);
        const embeds = allQuizzToDisplay.map(quizz => generateQuizzEmbed(quizz));
        if (allQuizzToDisplay.length === 0) {
            return sendHiddenReply(interaction, "Il n'y a aucun quizz de prévu sur cette période !");
        } else if (allQuizzToDisplay.length < 10) {
            const content = `Hello <@${interaction.user.id}>, voici les différents quizz à venir ou en cours !`;
            return interaction.reply({ embeds, content, ephemeral: true });
        } else {
            let i = 0;
            while (i < embeds.length) {
                const embedToSend = embeds.splice(i, i + 9);
                await interaction.user.send({ embeds: embedToSend });
                i += 10;
            }
            return sendHiddenReply(interaction, "Vous avez reçu les différents quizz à venir par MP !");
        }
    }
}