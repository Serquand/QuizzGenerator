import { Dialect } from "sequelize";

export default {
    HOST: process.env.DB_HOST,
    USER: process.env.DB_USER,
	PASSWORD: process.env.DB_PASSWORD,
    DB: process.env.DB_NAME,
    PORT: process.env.MODE === 'dev' ? 3006 : process.env.DB_PORT,
    DIALECT: 'mariadb' as Dialect,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}