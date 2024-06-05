import { DataTypes, Model } from 'sequelize';
import { UserAnswer as UserAnswerAttributes } from '../tools/types';
import connection from './connection';
import { Quizz } from './Quizz';
import { Question } from './Question';
import { PossibleAnswer } from './PossibleAnswer';

export class UserAnswer extends Model<UserAnswerAttributes> implements UserAnswerAttributes {
    uid!: string;
    userId!: string;
    questionId!: string;
    stillingTime!: number;
    quizzId!: string;
    answerId!: string;
    isRightAnswer!: boolean;
    numberOfPoints!: number;
    guildId!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static async getAllAnswersForGuild(guildId: string, quizzId: string | null = null): Promise<UserAnswer[]> {
        if(quizzId) return await UserAnswer.findAll({ where: { guildId, quizzId }, raw: true });
        else return await UserAnswer.findAll({ where: { guildId }, raw: true });
    }

    static async userHasAlreadyAnswered(userId: string, questionId: string): Promise<boolean> {
        return await UserAnswer.findOne({ where: { userId, questionId }, raw: true }) !== null;
    }
}

export default UserAnswer.init({
    uid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    answerId: {
        type: DataTypes.UUID,
        references: {
            model: PossibleAnswer,
            key: 'uid',
        },
        allowNull: true,
        onDelete: 'SET NULL',
    },
    guildId: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    isRightAnswer: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    numberOfPoints: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    questionId: {
        type: DataTypes.UUID,
        references: {
            model: Question,
            key: 'uid',
        },
        onDelete: 'SET NULL',
    },
    quizzId: {
        type: DataTypes.UUID,
        references: {
            model: Quizz,
            key: 'uid'
        },
        onDelete: 'SET NULL',
    },
    stillingTime: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userId: {
        type: DataTypes.STRING(20),
        allowNull: false,
    }
}, { sequelize: connection });