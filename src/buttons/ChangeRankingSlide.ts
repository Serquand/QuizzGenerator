import { ButtonInteraction, Client, Message } from "discord.js";
import { generateRankingComponents, generateRankingEmbed, getRanking } from "../tools/Quizz";
import { sendHiddenReply } from "../tools/discord";

export default {
    name: 'new_ranking_slide',
    execute: async (client: Client, interaction: ButtonInteraction) => {
        const newSlideIndex = Number.parseInt(interaction.customId.split('=')[1]);
        const ranking = await getRanking(interaction.guildId);
        if(ranking === "No users available") return sendHiddenReply(interaction, ranking);

        const name = `Ranking - ${newSlideIndex + 1}/${Math.ceil(ranking.length / 25)}`;
        const embed = generateRankingEmbed(ranking.slice(25 * newSlideIndex, 25 * (newSlideIndex + 1)), name, 25 * newSlideIndex);
        const component = generateRankingComponents(Math.floor(ranking.length / 25), newSlideIndex);
        await interaction.update({ embeds: [embed], components: [component] });

        return sendHiddenReply(interaction, "Le classement a bien été mis à jour !");
    }
}