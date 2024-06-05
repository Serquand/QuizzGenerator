import { ButtonInteraction, Client, GuildMember, TextChannel } from "discord.js";
import { fetchChannel, sendHiddenReply } from "../tools/discord";
import Quizz from "../models/Quizz";

export default {
    name: 'subscribe_to',
    execute: async (client: Client, interaction: ButtonInteraction) => {
        const quizzUid = interaction.customId.split('=')[1];
        const quizz = await Quizz.findOne({ where: { uid: quizzUid }, raw: true });
        if(!quizz) return sendHiddenReply(interaction);

        const quizzChannel = fetchChannel(client, quizz.channelId) as TextChannel;
        if(!quizzChannel || !quizzChannel.isText()) return sendHiddenReply(interaction);

        await quizzChannel.permissionOverwrites.edit(interaction.member as GuildMember, { VIEW_CHANNEL: true, SEND_MESSAGES: false });
        const message = await quizzChannel.send(`<@${interaction.user.id}>`);
        await message.delete();

        return sendHiddenReply(interaction, "Vous avez bien été ajouté au quizz !");
    }
}