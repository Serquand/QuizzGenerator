import { ButtonInteraction, Client, MessageEmbed } from "discord.js";
import PossibleAnswer from "../models/PossibleAnswer";
import { UserAnswer } from "../tools/types";
import { v4 } from "uuid";
import { calculeAmountOfPoints, extractTimeInformationForQuestionEmbed } from "../tools/Quizz";
import { UserAnswer as UserAnswerModel } from "../models/UserAnswer";
import { sendHiddenReply } from "../tools/discord";

export default {
    name: 'answer_with',
    execute: async (client: Client, interaction: ButtonInteraction) => {
        if(await UserAnswerModel.userHasAlreadyAnswered(interaction.user.id, interaction.customId.split('=')[1])) {
            return sendHiddenReply(interaction, "Tu as déjà répondu à cette question");
        }

        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.user.id;
        const answerUid = interaction.customId.split('=')[1];
        const possibleAnswer = await PossibleAnswer.getPossibility(answerUid);
        const validAnswer = await PossibleAnswer.getValidAnswer(possibleAnswer.questionId);
        const {answerTime: stillingTime, maxTime} = extractTimeInformationForQuestionEmbed(interaction.message.embeds.at(0) as MessageEmbed);
        const numberOfPoints = calculeAmountOfPoints(possibleAnswer.isRightAnswer, maxTime - stillingTime, maxTime);
        const {isRightAnswer, quizzId, questionId, uid: answerId, } = possibleAnswer;
        const guildId = interaction.guild.id;
        const uid = v4();
        const userAnswer: UserAnswer = { answerId, guildId, isRightAnswer, numberOfPoints, questionId, quizzId, uid, userId, stillingTime };
        await UserAnswerModel.create(userAnswer);

        setTimeout(() => {
            const description = `Expected answer : ${validAnswer}\nYour answer : ${possibleAnswer.labelAnswer}\nReward : ${numberOfPoints} points`
            sendHiddenReply(interaction, description);
        }, stillingTime * 1_000);
    }
}