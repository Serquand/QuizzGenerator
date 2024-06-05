import { Client, CommandInteraction } from "discord.js";
import { UserAnswer } from "../models/UserAnswer";
import { groupBy } from "../tools/utils";
import { RankingInformations } from "../tools/types";
import { generateRankingComponents, generateRankingEmbed, getRanking } from "../tools/Quizz";
import { sendHiddenReply } from "../tools/discord";

export default {
    name: 'show_ranking',
    description: "Dresse le classement",
    runSlash: async (client: Client, interaction: CommandInteraction) => {
        const ranking = await getRanking(interaction.guildId);
        if(ranking === "No users available") return sendHiddenReply(interaction, ranking);

        const name = `Ranking - 1/${Math.ceil(ranking.length / 25)}`;
        const embed = generateRankingEmbed(ranking, name);
        const component = generateRankingComponents(Math.floor(ranking.length / 25));

        return interaction.reply({ embeds: [embed], components: [component], ephemeral: true });
    }
}