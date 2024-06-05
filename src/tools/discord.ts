import { AnyChannel, ButtonInteraction, CategoryChannel, Client, CommandInteraction, Message, ModalSubmitInteraction, TextBasedChannel, TextChannel } from "discord.js";
import { QuestionModel, UserOpenAnswer } from "./types";
import { checkValidAnswer } from "./chatgpt";
import { v4 } from "uuid";
import { calculeAmountOfPoints } from "./Quizz";

export function sendHiddenReply(interaction: CommandInteraction | ButtonInteraction | ModalSubmitInteraction, log: string | undefined = undefined): void {
    log = log || "Something went wrong !";
    if(interaction.replied || interaction.deferred) {
        interaction.editReply(log);
        return;
    } else {
        try {
            interaction.reply({ content: log, ephemeral: true });
        } catch {
            console.log('Something went wrong when sending a hidden reply');
        }
        return;
    }
}

export async function createChannel(category: CategoryChannel, channelName: string): Promise<TextChannel> {
    const newChannel = await category.createChannel(channelName);
    return newChannel;
}

export function fetchChannel(client: Client, channelId: string): AnyChannel {
    return client.channels.cache.get(channelId);
}

export async function deleteChannel(client: Client, channelId: string) {
    const channel = fetchChannel(client, channelId);
    if(!channel) return;

    await channel.delete();
}

export async function fetchMessageInChannel(channel: TextBasedChannel, messageId: string): Promise<Message> {
    return await channel.messages.fetch(messageId, { force: true });
}

export async function fetchMessageForUrl(client: Client, url: string): Promise<Message> {
    const splittedInformations = url.split('/');
    const messageId = splittedInformations.at(-1);
    const channelId = splittedInformations.at(-2);

    const channel = fetchChannel(client, channelId);
    if(!channel.isText()) return null;

    return await fetchMessageInChannel(channel, messageId);
}

export async function deleteMessageForUrl (client: Client, url: string): Promise<void> {
    const message = await fetchMessageForUrl(client, url);
    if(message) {
        await message.delete();
    }
}

export async function getOldestMessage(channel: TextBasedChannel): Promise<Message | undefined> {
    let oldestMessage: Message | undefined;
    let beforeId: string | undefined;

    while (true) {
        const messages = await channel.messages.fetch({ limit: 100, before: beforeId });
        if (messages.size === 0) break;
        const fetchedMessages = Array.from(messages.values());
        if (!oldestMessage || fetchedMessages[fetchedMessages.length - 1].createdTimestamp < oldestMessage.createdTimestamp) {
            oldestMessage = fetchedMessages[fetchedMessages.length - 1];
        }
        beforeId = fetchedMessages[fetchedMessages.length - 1].id;
    }

    return oldestMessage;
}

export async function* waitForAllUsersAnswers(client: Client, channelId: string, time: number, question: QuestionModel): AsyncGenerator<UserOpenAnswer> {
    const channel = fetchChannel(client, channelId);
    if(!channel || !channel.isText()) return;

    const questionSentAt = Date.now();
    const collector = channel.createMessageCollector();
    for await (const message of collector) {
        const isRightAnswer = await checkValidAnswer(question.label, message.content);
        const numberOfPoints = calculeAmountOfPoints(isRightAnswer, (Date.now() - questionSentAt) / 1_000, time);
        yield {
            userId: message.author.id,
            answerLabel: message.content,
            guildId: message.guildId,
            isRightAnswer,
            numberOfPoints: numberOfPoints,
            questionId: question.uid,
            quizzId: question.quizzId,
            stillingTime: Date.now() - questionSentAt,
            uid: v4()
        }
    }
}