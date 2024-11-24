const { Sequelize } = require('sequelize');

const database = new Sequelize('finalNoFace', 'Furini', '1234', {
    host: 'localhost',
    dialect: 'mysql',
});

module.exports = database;

