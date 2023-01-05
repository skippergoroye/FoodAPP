import {Sequelize} from 'sequelize';

export const sequelizeDB = new Sequelize('app', '', '', {
    storage: './food.sqlite',
    dialect: 'sqlite',
    logging: false
})
