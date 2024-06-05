import { Client, CommandInteraction, GuildBasedChannel } from "discord.js";
import { createChannel, sendHiddenReply } from "../tools/discord";
import { convertDateToTimestamp, isValidDate } from "../tools/date";
import { generateQuizzEmbed, generateRankingEmbed, generateSubscriptionComponent } from "../tools/Quizz";
import { v4 } from 'uuid';
import { Quizz } from "../models/Quizz";
import { QuizzModel } from "../tools/types";

export default {
    name: 'generate_quizz',
    description: "Generate a new quizz",
    options: [
        {
            name: 'quizz_name',
            description: "The name of the quizz",
            type: "STRING",
            required: true,
        },
        {
            name: 'second_per_question',
            description: 'Number of seconds per question',
            type: "NUMBER",
            required: true,
        },
        {
            name: 'number_of_questions',
            description: 'Number of questions to generate',
            type: "NUMBER",
            required: true,
        },
        {
            name: 'category',
            description: 'Category where create the channel for the quiz',
            type: "CHANNEL",
            required: true,
            channelTypes: ['GUILD_CATEGORY']
        },
        {
            name: 'begin_date',
            description: 'The date of the beginning (format : DD/MM/YYYY HH:MM)',
            type: "STRING",
            required: true,
        },
        {
            name: 'subject',
            description: 'The subject of the quizz',
            type: "STRING",
            required: true,
        },
        {
            name: 'mode',
            description: 'The mode of the quizz (Free answers or QCM)',
            type: "STRING",
            choices: [{ name: 'Free answers', value: 'FREE' }, { name: 'QCM', value: 'QCM' }],
            required: true,
        }
    ],
    runSlash: async (client: Client, interaction: CommandInteraction) => {
        const numberOfSecondsPerQuestion = interaction.options.getNumber('second_per_question');
        const numberOfQuestions = interaction.options.getNumber('number_of_questions');
        const category = interaction.options.getChannel('category') as GuildBasedChannel;
        const name = interaction.options.getString('quizz_name');
        const beginDate = interaction.options.getString('begin_date');
        const subject = interaction.options.getString('subject');
        const mode = interaction.options.getString('mode');
        const everyoneRole = interaction.guild.roles.everyone;

        if (numberOfSecondsPerQuestion < 1) return sendHiddenReply(interaction, 'The number of seconds per question could not be lower or equal to 0');
        if (numberOfQuestions < 1) return sendHiddenReply(interaction, 'The number of questions could not be lower or equal to 0');
        if (category.type !== 'GUILD_CATEGORY') return sendHiddenReply(interaction, 'The category is not valid');
        if (!isValidDate(beginDate)) return sendHiddenReply(interaction, "The begin date is not valid");
        if (!await Quizz.isValidName(interaction.guildId, name)) return sendHiddenReply(interaction, 'The name is not valid');
        if(name.length > 255) return sendHiddenReply(interaction, 'The name is too long ! Max length : 255 characters');
        if(subject && subject.length > 255) return sendHiddenReply(interaction, 'The subject is too long ! Max length : 255 characters');
        if (mode !== 'FREE' && mode !== 'QCM') return sendHiddenReply(interaction);

        const channel = await createChannel(category, `Quizz ${name}`);
        await channel.permissionOverwrites.edit(everyoneRole, { VIEW_CHANNEL: false, SEND_MESSAGES: false });
        const uid = v4();
        const component = generateSubscriptionComponent(uid);
        const newQuizzData: QuizzModel = {
            beginDate: convertDateToTimestamp(beginDate),
            channelId: channel.id,
            guildId: interaction.guildId,
            name,
            numberOfQuestions,
            uid,
            numberOfSecondsPerQuestion,
            status: 'incoming',
            subscriptionMessageUrl: "",
            quizzSubject: subject,
            mode,
        };
        const embed = generateQuizzEmbed(newQuizzData);
        const message = await interaction.channel.send({
            content: "Hello @everyone, un nouveau quizz vient d'être créé ! Si vous voulez vous inscrire, cliquer sur le bouton ci-dessous",
            components: [component],
            embeds: [embed]
        });
        newQuizzData.subscriptionMessageUrl = message.url;

        await Quizz.create(newQuizzData);

        const rankingEmbed = generateRankingEmbed([], 'Quizz ranking', 0);
        await channel.send({ embeds: [embed, rankingEmbed] })

        sendHiddenReply(interaction, "The quizz has been successfully created !");
    }
}