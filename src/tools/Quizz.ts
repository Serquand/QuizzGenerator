import { AutocompleteInteraction, Client, EmbedFieldData, Message, MessageActionRow, MessageButton, MessageEmbed } from "discord.js"
import { AutocompleteInformations, PossibleAnswer, Question, QuestionModel, QuestionTimeInformation, Quizz, QuizzModel, RankingInformations } from "./types"
import { convertPrintableTimeToSeconds, convertSecondsToPrintableTime } from "./date"
import { Quizz as QuizzDb } from "../models/Quizz"
import { convertPlaceToString, groupBy } from "./utils"
import { PossibleAnswer as PossibleAnswerModel } from "../models/PossibleAnswer"
import { Question as QuestionDb } from "../models/Question"
import { fetchChannel, getOldestMessage, waitForAllUsersAnswers } from "./discord"
import { BOT_NAME, EMBED_IMAGE_URL } from "../config/discord.config"
import UserAnswer from "../models/UserAnswer"
import { generateNewQuestions } from "./chatgpt"

export const generateQuizzEmbed = (quizz: QuizzModel) => {
    return new MessageEmbed()
        .setTitle(quizz.name)
        .setColor('DARK_BLUE')
        .setAuthor({ name: BOT_NAME, iconURL: EMBED_IMAGE_URL })
        .setThumbnail(EMBED_IMAGE_URL)
        .setFields(
            { name: 'Begin the', value: `<t:${quizz.beginDate / 1_000}:F>`, inline: true },
            { name: 'Begin in', value: `<t:${quizz.beginDate / 1_000}:R>`, inline: true },
            { name: '\u200b', value: `\u200b`, inline: true },
            { name: 'Nombre de questions', value: `${quizz.numberOfQuestions} questions`, inline: true },
            { name: 'Durée des questions', value: convertSecondsToPrintableTime(quizz.numberOfSecondsPerQuestion), inline: true },
            { name: 'Durée du quizz', value: convertSecondsToPrintableTime(quizz.numberOfSecondsPerQuestion * quizz.numberOfQuestions), inline: true },
            { name: 'Channel', value: `<#${quizz.channelId}>`, inline: true },
            { name: 'Statut', value: quizz.status.toUpperCase(), inline: true },
        )
}

export const generateSubscriptionComponent = (quizzId: string) => {
    const button = new MessageButton()
        .setCustomId(`subscribe_to=${quizzId}`)
        .setDisabled(false)
        .setEmoji('✅')
        .setLabel('Subscribe to the quizz')
        .setStyle('SUCCESS')
    return new MessageActionRow().addComponents(button);
}

export const generateQuestionDescription = (question: Question) => {
    const answers = question.listPossibleAnswers.map((answer, el) => `${el + 1}. ${answer.labelAnswer}`).join('\n');
    return `### Question : ${question.label}\n\n### Réponses :\n ${answers}`;
}

export const generateQuestionEmbed = (quizz: QuizzDb, question: Question) => {
    const endTime = Math.floor(Date.now() / 1_000) + quizz.numberOfSecondsPerQuestion;
    return new MessageEmbed()
        .setAuthor({ name: BOT_NAME, iconURL: EMBED_IMAGE_URL })
        .setTitle(`${quizz.name} - (${question.questionNumber}/${quizz.numberOfQuestions})`)
        .setThumbnail(EMBED_IMAGE_URL)
        .setFields(
            { name: 'Durée de la question', value: convertSecondsToPrintableTime(quizz.numberOfSecondsPerQuestion), inline: true },
            { name: 'Fin de la question', value: `<t:${endTime}:R>`, inline: true }
        )
        .setDescription(generateQuestionDescription(question))
        .setColor('DARK_BLUE')
        .setTimestamp(Date.now());
}

export const generateQuestionButtons = (question: Question, mode: 'QCM' | 'FREE') => {
    if(mode === 'FREE') {
        const newButton = new MessageButton()
            .setCustomId('answer_to=' + question.uid)
            .setDisabled(false)
            .setEmoji('📝')
            .setLabel('Saisis ta réponse')
            .setStyle('PRIMARY');
        return [new MessageActionRow().addComponents(newButton)];
    }

    const emojis = ['🇦', '🇧', '🇨', '🇩'];
    const allButtons: MessageButton[] = [];
    for (const [index, answer] of question.listPossibleAnswers.entries()) {
        const newButton = new MessageButton()
            .setCustomId('answer_with=' + answer.uid)
            .setDisabled(false)
            .setEmoji(emojis[index])
            .setLabel(answer.labelAnswer.slice(0, 79))
            .setStyle('PRIMARY')
        allButtons.push(newButton);
    }
    return [new MessageActionRow().addComponents(...allButtons)];
}

export const generateQuestions = async (numberOfQuestionToGenerate: number, quizzId: string, subject: string | null, mode: 'QCM' | 'FREE'): Promise<Question[]> => {
    return await generateNewQuestions(numberOfQuestionToGenerate, quizzId, subject, mode);
}

export const storeQuestionInDatabase = async (questions: Question[]) => {
    const listQuestionsToAddInDb: QuestionModel[] = [];
    const listAnswerToAddInDb: PossibleAnswer[] = [];

    for (const question of questions) {
        const { isSent, label, questionNumber, quizzId, uid } = question;
        listQuestionsToAddInDb.push({ isSent, label, questionNumber, quizzId, uid, mode: question.mode });
        listAnswerToAddInDb.push(...question.listPossibleAnswers);
    }

    await QuestionDb.bulkCreate(listQuestionsToAddInDb);
    await PossibleAnswerModel.bulkCreate(listAnswerToAddInDb)
}

export const autocompleteWithQuizzName = async (interaction: AutocompleteInteraction) => {
    const begin = interaction.options.getFocused();
    const allQuizz = await QuizzDb.getAllQuizz(interaction.guildId);
    let quizzToSend: QuizzModel[] | AutocompleteInformations[] = allQuizz.filter(quizz => quizz.name.includes(begin));
    quizzToSend = quizzToSend.map(quizz => ({ name: quizz.name, value: quizz.name }));
    return interaction.respond(quizzToSend.slice(0, 10));
}

export const updateRankingAfterQuestion = async (client: Client, quizz: QuizzDb) => {
    const channel = fetchChannel(client, quizz.channelId);
    if(!channel || !channel.isText()) return;

    const firstMessage = await getOldestMessage(channel);
    const ranking = await getRanking(quizz.guildId, quizz.uid);
    if(ranking === 'No users available') return;

    const name = `Quizz  ranking - 1/${Math.ceil(ranking.length / 25)}`;
    const embeds = [firstMessage.embeds.at(0), generateRankingEmbed(ranking, name)];

    await firstMessage.edit({ embeds });
}

export const startGame = (client: Client, quizz: QuizzDb) => {
    let oldMessage: Message | null;
    const channel = fetchChannel(client, quizz.channelId)
    if(channel && channel.isText()) channel.send('Hello @everyone, le quizz va bientôt commencer !');

    const x = setInterval(async () => {
        if (oldMessage) {
            await Promise.all([oldMessage.delete(), updateRankingAfterQuestion(client, quizz)]);
        }

        const nextQuestion = await QuestionDb.getTheNextQuestion(quizz.uid);
        if (!nextQuestion) {
            clearInterval(x);
            return;
        }

        oldMessage = await sendQuestionInChannel(client, quizz, nextQuestion);
        await QuestionDb.updateSendStatus(true, nextQuestion.uid);
    }, quizz.numberOfSecondsPerQuestion * 1_000);
}

export const sendQuestionInChannel = async (client: Client, quizz: QuizzDb, question: Question) => {
    const embed = generateQuestionEmbed(quizz, question);
    const components = generateQuestionButtons(question, quizz.mode);
    const channel = fetchChannel(client, quizz.channelId);
    if (!channel || !channel.isText()) return;

    // @ts-ignore
    const message = await channel.send({ embeds: [embed], components });
    return message;
}

export function extractTimeInformationForQuestionEmbed(embed: MessageEmbed): QuestionTimeInformation {
    const maxTime = embed.fields.find(field => field.name === 'Durée de la question').value;
    const maxSeconds = convertPrintableTimeToSeconds(maxTime);

    const questionEndTime = embed.fields.find(field => field.name === 'Fin de la question').value;
    const questionEndTimestamp = Number.parseInt(questionEndTime.split(":")[1]);
    const now = Date.now() / 1_000; // In Seconds
    const answerTime = questionEndTimestamp - now;

    return { answerTime, maxTime: maxSeconds };
}

export function calculeAmountOfPoints(correct: boolean, answerTime: number, maxTime: number): number {
    if (!correct) return 0;

    const timeRatio = Math.max(0, Math.min((maxTime - answerTime) / maxTime, 1));
    return Math.floor(timeRatio * 1000);
}

export const launchQuizzNow = async (client: Client) => {
    const quizzToLaunch = await QuizzDb.getAllQuizzThatNeedToBeLaunchedNow();
    for (const quizz of quizzToLaunch) {
        const quizzQuestions = await generateQuestions(quizz.numberOfQuestions, quizz.uid, quizz.quizzSubject, quizz.mode);
        await storeQuestionInDatabase(quizzQuestions);
        startGame(client, quizz);
    }
}

export function generateRankUserInformation(user: RankingInformations[number]) {
    return `
        User : <@${user.userId}>
        Total answers : ${user.numberOfAnswer}
        Number of valid answers : ${user.numberOfValidAnswers}
        Win rate : ${Math.floor((user.numberOfValidAnswers / user.numberOfAnswer) * 100)}%
        Number of points : ${user.numberOfPoints}
    `;
}

export function generateRankingComponents(maxSlide: number, currentSlide: number = 0, quizzId: string = '') {
    const endOfCustomId = quizzId ? `&quizz_id=${quizzId}` : '';
    const previousButton = new MessageButton()
        .setCustomId(`new_ranking_slide=${currentSlide - 1}${endOfCustomId}`)
        .setEmoji('⏮️')
        .setDisabled(currentSlide === 0)
        .setLabel('Previous')
        .setStyle('PRIMARY');
    const nextButton = new MessageButton()
        .setCustomId(`new_ranking_slide=${currentSlide + 1}${endOfCustomId}`)
        .setEmoji('⏭️')
        .setDisabled(maxSlide === currentSlide)
        .setLabel('Next')
        .setStyle('PRIMARY');

    return new MessageActionRow().addComponents(previousButton, nextButton);
}

export function generateRankingEmbed(ranking: RankingInformations, title: string, startsAt: number = 0): MessageEmbed {
    const fields: EmbedFieldData[] = ranking.map((user, index) => ({
        name: convertPlaceToString(index + 1 + startsAt),
        value: generateRankUserInformation(user),
        inline: true,
    }));
    return new MessageEmbed()
        .setAuthor({ name: BOT_NAME, iconURL: EMBED_IMAGE_URL })
        .setThumbnail(EMBED_IMAGE_URL)
        .setTitle(title)
        .setColor('DARK_BLUE')
        .setFields(...fields.slice(0, 25));
}

export async function getRanking(guildId: string, quizzId: string | null = null) {
    const allUsersAnswers = await UserAnswer.getAllAnswersForGuild(guildId, quizzId);
    if (allUsersAnswers.length === 0) return "No users available";

    const answersByUsers = groupBy(allUsersAnswers, answer => answer.userId);
    const ranking: RankingInformations = [];
    for (const user in answersByUsers) {
        let numberOfPoints = 0, numberOfValidAnswers: number = 0;
        answersByUsers[user].forEach(answer => {
            if (answer.isRightAnswer) {
                numberOfPoints += answer.numberOfPoints;
                numberOfValidAnswers += 1;
            }
        });

        ranking.push({ numberOfAnswer: answersByUsers[user].length, numberOfPoints, numberOfValidAnswers, userId: user });
    }

    return ranking.sort((a, b) => b.numberOfPoints - a.numberOfPoints);
}