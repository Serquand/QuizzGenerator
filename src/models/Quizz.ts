import { DataTypes, Model, Op } from "sequelize";
import { QuizzModel } from "../tools/types";
import connection from "./connection";
import { getTimestampForCurrentMinute } from "../tools/date";

export class Quizz extends Model<QuizzModel> implements QuizzModel {
    subscriptionMessageUrl!: string;
    guildId!: string;
    name!: string;
    uid!: string;
    beginDate!: number;
    numberOfQuestions!: number;
    numberOfSecondsPerQuestion!: number;
    channelId!: string;
    status!: 'incoming' | 'past' | 'running';
    quizzSubject: string;
    mode: "QCM" | "FREE";

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static async isValidName(guildId: string, name: string): Promise<boolean> {
        const numberOfQuizz = await Quizz.count({ where: { guildId, name } });
        return numberOfQuizz === 0;
    }

    static async getAllQuizzThatNeedToBeLaunchedNow(): Promise<Quizz[]> {
        return await Quizz.findAll({ where: {
            beginDate: getTimestampForCurrentMinute(),
            status: 'incoming'
        }, raw: true });
    }

    static async getQuizzByName(guildId: string, name: string): Promise<Quizz> {
        return await Quizz.findOne({ where: { guildId, name }, raw: true });
    }

    static async getAllQuizz(guildId: string): Promise<Quizz[]> {
        return await Quizz.findAll({ where: { guildId }, raw: true });
    }

    static async getAllIncomingOrRunningQuizz(guildId: string) : Promise<Quizz[]> {
        return await Quizz.findAll({ where: { guildId, status: { [Op.not]: 'past' } }, raw: true });
    }

    static async deleteAndReturnQuizz(guildId: string, name: string): Promise<Quizz | false> {
        const quizzToDelete = await Quizz.findOne({ where: { guildId, name }, raw: true });
        if(!quizzToDelete) return false;

        try {
            await Quizz.destroy({ where: { guildId, name } });
            return quizzToDelete;
        } catch (err) {
            console.error(err);
            return null;
        }
    }
}

export default Quizz.init({
    guildId: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    uid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    quizzSubject: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    subscriptionMessageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    beginDate: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('incoming', 'past', 'running'),
        defaultValue: 'incoming',
        allowNull: false,
    },
    numberOfQuestions: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    numberOfSecondsPerQuestion: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    channelId: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    mode: {
        type: DataTypes.ENUM('FREE', 'QCM'),
        allowNull: false,
    }
}, { sequelize: connection });