import OpenAI from "openai";

export type KeyFunction<T> = (item: T) => string | number;

export interface QuizzModel {
    subscriptionMessageUrl: string;
    name: string;
    guildId: string;
    uid: string;
    beginDate: number;
    numberOfQuestions: number;
    quizzSubject: string;
    numberOfSecondsPerQuestion: number;
    channelId: string;
    status: 'incoming' | 'past' | 'running';
    mode: 'QCM' | 'FREE';
}

export interface Quizz extends QuizzModel {
    listQuestions: Array<Question>;
}

export interface QuestionTimeInformation {
    answerTime: number;
    maxTime: number;
}

export interface QuestionModel {
    uid: string;
    label: string;
    quizzId: string;
    questionNumber: number;
    isSent: boolean;
    mode: 'QCM' | 'FREE';
}

export interface Question extends QuestionModel {
    listPossibleAnswers: Array<PossibleAnswer>;
    listUsersAnswers: Array<UserAnswer>;
}

export interface PossibleAnswer {
    uid: string;
    questionId: string;
    labelAnswer: string;
    isRightAnswer: boolean;
    quizzId: string;
}


export interface AutocompleteInformations {
    name: string;
    value: string;
}[];

export type RankingInformations = {
    userId: string;
    numberOfPoints: number;
    numberOfValidAnswers: number;
    numberOfAnswer: number;
}[];

export type ChatGPTMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export interface BasisUserAnswer {
    uid: string;
    userId: string;
    questionId: string;
    stillingTime: number;
    isRightAnswer: boolean;
    quizzId: string;
    numberOfPoints: number;
    guildId: string;
}

export interface UserAnswer extends BasisUserAnswer {
    answerId: string;
}

export interface UserOpenAnswer extends BasisUserAnswer {
    answerLabel: string;
}