import { Client, CommandInteraction } from "discord.js";
import Quizz from "../models/Quizz";
import { deleteChannel, deleteMessageForUrl, sendHiddenReply } from "../tools/discord";
import { autocompleteWithQuizzName } from "../tools/Quizz";

export default {
    name: 'delete_quizz',
    description: 'Delete a quizz',
    options: [
        {
            name: 'quizz_name',
            description: 'The name of the quizz to delete',
            type: "STRING",
            required: true,
            autocomplete: true,
        }
    ],
    runSlash: async (client: Client, interaction: CommandInteraction) => {
        const quizzName = interaction.options.getString('quizz_name');
        const deletedQuizz = await Quizz.deleteAndReturnQuizz(interaction.guildId, quizzName);

        if(deletedQuizz === false) return sendHiddenReply(interaction, "Le quizz n'a pas été trouvé !");
        if(deletedQuizz === null) return sendHiddenReply(interaction);

        await Promise.all([
            deleteChannel(client, deletedQuizz.channelId),
            deleteMessageForUrl(client, deletedQuizz.subscriptionMessageUrl),
        ]);

        return sendHiddenReply(interaction, "Vous avez bien supprimé le quizz !");
    },
    autocomplete: autocompleteWithQuizzName,
}