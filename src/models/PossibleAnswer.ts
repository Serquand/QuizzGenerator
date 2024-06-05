import { Model, DataTypes } from "sequelize";
import { PossibleAnswer as PossibleAnswerAttributes } from "../tools/types";
import connection from "./connection";
import { Question } from "./Question";
import { Quizz } from "./Quizz";

export class PossibleAnswer extends Model<PossibleAnswerAttributes> implements PossibleAnswerAttributes {
    uid!: string;
    questionId!: string;
    labelAnswer!: string;
    isRightAnswer!: boolean;
    quizzId!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static async getPossibility(uid: string): Promise<PossibleAnswer> {
        return PossibleAnswer.findOne({ where: { uid }, raw: true });
    }

    static async getValidAnswer(questionId: string): Promise<string> {
        const validAnswer = await PossibleAnswer.findOne({
            where: { questionId, isRightAnswer: true },
            attributes:['labelAnswer'],
            raw: true
        });
        return validAnswer.labelAnswer;
    }
}

export default PossibleAnswer.init({
    uid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    questionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Question,
            key: 'uid',
        },
        onDelete: 'CASCADE',
    },
    labelAnswer: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isRightAnswer: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    quizzId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Quizz,
            key: 'uid',
        },
        onDelete: 'CASCADE',
    }
}, { sequelize: connection });