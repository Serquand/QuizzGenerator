import OpenAI, {  } from 'openai';
import { ChatGPTMessage, Question } from './types';
import { v4 } from 'uuid';

const openai = new OpenAI({ apiKey: process.env['OPEN_AI_TOKEN'] });
const questionThreadMessages: ChatGPTMessage[] = [];
const subjectThreadMessages: ChatGPTMessage[] = [];
const answerThreadMessages: ChatGPTMessage[] = [];

export async function setup() {
    questionThreadMessages.push({
        role: 'user',
        content: "Tu es un prof expert en QCM. Ton but va être de m'aider en réalisant des questions avec 4 possibilités de réponse sur des sujets donnés." +
            "La première réponse sera correcte, et ensuite les 3 suivantes seront mauvaises.\nLe format de ta réponse sera : \n" +
            "**Question :** <question>\n**Réponse 1 :** <bonne réponse>\n**Réponse 2 :** <mauvaise réponse>\n**Réponse 3:** <mauvaise réponse>\n**Réponse 4 :** <mauvaise réponse>"
    });

    subjectThreadMessages.push({
        role: 'user',
        content: `Tu es un prof expert en QCM. Ton but va être de m'aider en me donnant des thèmes pour générer ces QCM.` +
            ` Lorsque je t'en demanderai, tu répondras avec uniquement le thème généré. Par exemple : "La Seconde Guerre Mondiale".`
    });

    answerThreadMessages.push({
        role: 'user',
        content: "Tu es un professeur dont la mission est de corriger différentes réponses. Je vais te donner une question ainsi qu'une proposition de réponse sous le format : \n" +
            "Question : <question> \nRéponse : <réponse> \nEn répondant par \"Oui.\" ou par \"Non.\", tu vas devoir répondre à ma question. As-tu compris ?"
    });
}

export async function generateSubjectForQuestions(): Promise<string> {
    const newMessage: ChatGPTMessage = { role: 'user', content: 'Génère-moi un nouveau thème' };
    const chatCompletion = await openai.chat.completions.create({ messages: [...subjectThreadMessages, newMessage], model: 'gpt-3.5-turbo' });
    return chatCompletion.choices.at(0).message.content;
}

export async function generateNewQuestions (numberOfQuestionsToGenerate: number, quizzId: string, subject: string | null, mode: "FREE" | 'QCM'): Promise<Question[]> {
    const localSubject: string = subject ?? await generateSubjectForQuestions();
    const newMessage: ChatGPTMessage = {
        content: `Génère moi ${numberOfQuestionsToGenerate} questions sur le thème ${localSubject}  avec les instructions précédentes.`,
        role: 'user',
    }
    const chatCompletion = await openai.chat.completions.create({ messages: [...questionThreadMessages, newMessage], model: 'gpt-3.5-turbo' });

    return parseNewQuestionString(chatCompletion.choices[0].message.content, quizzId, mode);
}

export async function checkValidAnswer(question: string, answer: string): Promise<boolean> {
    const newMessage: ChatGPTMessage = { role: 'user', content: `Question : ${question}\nRéponse : ${answer}` };
    const chatCompletion = await openai.chat.completions.create({ messages: [...answerThreadMessages, newMessage], model: 'gpt-4o' });
    return chatCompletion.choices[0].message.content.includes('Oui');
}

export function convertLabelsToQuestion (labels: string[], questionNumber: number, quizzId: string, mode: "FREE" | "QCM"): Question {
    const questionId = v4();
    const label = labels[0];
    const listPossibleAnswers = mode === 'QCM' ? labels.slice(1).map((label, index) => ({ isRightAnswer: index === 0,  labelAnswer: label, questionId, quizzId, uid: v4() })) : [];
    return { isSent: false, label, listPossibleAnswers, listUsersAnswers: [], questionNumber, quizzId, uid: questionId, mode };
}

export function parseNewQuestionString(content: string, quizzId: string, mode: "FREE" | "QCM"): Question[] {
    const individualQuestion = content.split('\n\n');
    const allQuestions: Question[] = [];
    for(let i = 0; i < individualQuestion.length; i++) {
        const labels = individualQuestion[i].split(':** ').slice(1);
        for(let i = 0; i < labels.length; i++) {
            labels[i] = labels[i].split('\n**Réponse ')[0].trim();
        }
        allQuestions.push(convertLabelsToQuestion(labels, i + 1, quizzId, mode));
    }
    return allQuestions;
}