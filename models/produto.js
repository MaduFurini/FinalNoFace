const Sequelize = require('sequelize');
const database = require('../db');

const Produto = database.define('produtos', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    id_referencia: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: 'produtos',
            key: 'id'
        }
    },
    id_categoria: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'categorias',
            key: 'id'
        }
    },
    id_variacao: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
            model: 'variacoes',
            key: 'id'
        }
    },
    nome: {
        type: Sequelize.STRING,
        allowNull: false
    },
    descricao: {
        type: Sequelize.STRING,
        allowNull: true
    },
    preco: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    },
    updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    }
});

module.exports = Produto;
