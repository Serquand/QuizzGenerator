import { Client, MessageEmbed, ModalSubmitInteraction } from "discord.js";
import { calculeAmountOfPoints, extractTimeInformationForQuestionEmbed } from "../tools/Quizz";
import { checkValidAnswer } from "../tools/chatgpt";
import UserAnswerModel from "../models/UserAnswer";
import { v4 } from "uuid";
import Question from "../models/Question";
import { UserAnswer } from "../tools/types";
import { sendHiddenReply } from "../tools/discord";

export default {
    name: 'answer_to',
    async execute(client: Client, interaction: ModalSubmitInteraction) {
        await interaction.deferReply({ ephemeral: true });

        if(await UserAnswerModel.userHasAlreadyAnswered(interaction.user.id, interaction.customId.split('=')[1])) {
            return sendHiddenReply(interaction, "Tu as déjà répondu à cette question");
        }

        const embed = interaction.message.embeds.at(0) as MessageEmbed;
        if(!embed) return;

        const questionId = interaction.customId.split('=')[1];
        const question = await Question.getQuestionByUid(questionId);
        const quizzId = question.quizzId;
        const userId = interaction.user.id;
        const answerLabel = interaction.fields.getTextInputValue('answer_label');
        const {answerTime: stillingTime, maxTime} = extractTimeInformationForQuestionEmbed(embed);
        const isRightAnswer = await checkValidAnswer(question.label, answerLabel);
        const numberOfPoints = calculeAmountOfPoints(isRightAnswer, maxTime - stillingTime, maxTime);
        const guildId = interaction.guild.id;
        const uid = v4();
        const answerId = null;
        const userAnswer: UserAnswer = { answerId, guildId, numberOfPoints, questionId, quizzId, uid, userId, stillingTime, isRightAnswer };
        await UserAnswerModel.create(userAnswer);

        setTimeout(() => {
            const description = `Your answer : ${answerLabel}\nReward : ${numberOfPoints} points`
            sendHiddenReply(interaction, description);
        }, stillingTime * 1_000);
    }
}