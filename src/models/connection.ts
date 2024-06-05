import dbConfig from '../config/db.config';
import { Sequelize } from 'sequelize';

const PORT = process.env.MODE === 'prod' && dbConfig.PORT ? dbConfig.PORT : undefined;
export default new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.DIALECT as 'mysql' | 'postgres',
    port: PORT as number,
    logging: process.env.MODE === 'prod',
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle
    },
});