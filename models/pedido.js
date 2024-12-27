const Sequelize = require('sequelize');
const database = require('../db');

const Pedido = database.define('pedidos', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    codigo:{
        type: Sequelize.STRING,
        allowNull: false
    },
    status:{
        type: Sequelize.ENUM ('Realizado', 'Em andamento', 'Em entrega', 'Entregue', 'Cancelado', 'Inativado'),
        allowNull: false,
    },
    valorTotal:{
        type: Sequelize.DOUBLE,
        allowNull: false,
        default: 0.0
    },
    observacao:{
        type: Sequelize.TEXT,
        allowNull: true
    },
    formaPagamento: {
        type: Sequelize.ENUM('debito', 'credito', 'dinheiro', 'pix'),
        allowNull: false
    },
    pago:{
        type: Sequelize.BOOLEAN,
        allowNull: false,
        default: false
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

module.exports = Pedido;