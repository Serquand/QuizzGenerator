import { Model, DataTypes } from "sequelize";
import { QuestionModel, Question as QuestionType } from "../tools/types";
import { Quizz } from "./Quizz";
import connection from "./connection";
import PossibleAnswer from "./PossibleAnswer";

export class Question extends Model<QuestionModel> implements QuestionModel {
    uid!: string;
    label!: string;
    quizzId!: string;
    questionNumber!: number;
    isSent!: boolean;
    mode: "QCM" | "FREE";

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static async getTheNextQuestion (quizzUid: string): Promise<QuestionType> {
        const nextQuestion = await Question.findOne({
            where: { quizzId: quizzUid, isSent: false },
            limit: 1,
            order: [['questionNumber', 'ASC']],
            raw: true,
        });

        if(!nextQuestion) return null;

        const {isSent, label, questionNumber, quizzId, uid, mode} = nextQuestion;
        const allAnswers = await PossibleAnswer.findAll({ where: { quizzId: quizzUid, questionId: uid }, raw: true, });
        return { isSent, label, listPossibleAnswers: allAnswers, listUsersAnswers: [], questionNumber, quizzId, uid, mode }
    }

    static async updateSendStatus(isSent: boolean, uid: string) {
        await Question.update({ isSent }, { where: { uid } });
    }

    static async getQuestionByUid(uid: string): Promise<Question> {
        return await Question.findOne({ where: { uid }, raw: true });
    }
}

export default Question.init({
    uid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    label: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    quizzId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Quizz,
            key: 'uid'
        },
        onDelete: 'CASCADE',
    },
    questionNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    isSent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    mode: {
        type: DataTypes.ENUM('FREE', 'QCM'),
        allowNull: false,
    }
}, { sequelize: connection });