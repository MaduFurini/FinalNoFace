const Pedido = require('../models/pedido');
const PedidoProduto = require('../models/produtoPedido');
const Produto = require('../models/produto');

const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const ProdutoPedido = require("../models/produtoPedido");
const path = require("path");
const fs = require("fs");

const index = async (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    const searchTerm = req.query.codigo || '';

    let itens = null;
    let count = null;

    try {
        if (searchTerm) {
            const result = await Pedido.findAndCountAll({
                where: {
                    codigo: {
                        [Op.like]: `%${searchTerm}%`
                    }
                },
                limit: limit,
                offset: offset
            });
            count = result.count;
            itens = result.rows;
        } else {
            const result = await Pedido.findAndCountAll({
                limit: limit,
                offset: offset
            });
            count = result.count;
            itens = result.rows;
        }

        const totalPages = Math.ceil(count / limit);

        return { itens, currentPage: page, totalPages };
    } catch (e) {
        return { error: e.message };
    }
};


const store = async (req) => {
    const { usuario, valorTotal, observacao, formaPagamento } = req.body;

    try {
        const prefix = "NFC";
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        let codigoUnico = false;
        let codigoGerado = "";

        while (!codigoUnico) {
            let randomSuffix = "";

            for (let i = 0; i < 8; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                randomSuffix += characters[randomIndex];
            }

            codigoGerado = prefix + randomSuffix;

            const codigoExistente = await Pedido.findOne({ where: { codigo: codigoGerado } });

            if (!codigoExistente) {
                codigoUnico = true;
            }
        }

        await Pedido.create({
            id_usuario: usuario,
            codigo: codigoGerado,
            status: 'Realizado',
            valorTotal: valorTotal,
            observacao: observacao,
            formaPagamento: formaPagamento,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return true;
    } catch (e) {
        return { error: "Erro ao listar pedidos" };
    }
}

const update = async (req) => {
    const { status, obs, formaPag } = req.body;
    const { id } = req.params;

    try {
        const item = await Pedido.findByPk(id);

        if (!item) {
            return { error: "Item não encontrado" };
        }

        item.status = status || item.status;
        item.observacao = obs || item.observacao;
        item.formaPagamento = formaPag || item.formaPagamento;

        item.updatedAt = new Date();

        await item.save();

        return true;
    } catch (e) {
        return { error: "Erro ao atualizar funcionário" };
    }
}

const destroy = async (req) => {
    const { id } = req.params;

    try {
        const item = await Pedido.findByPk(id);

        if (!item) {
            return { error: 'Pedido não encontrado' };
        }

        const relacao = await ProdutoPedido.findOne({
            where: {
                id_pedido: id
            }
        });

        if (relacao) {
            item.status = 0;
            item.updatedAt = new Date();

            await item.save();

            return { message: 'Pedido inativado devido a vínculos existentes' };
        } else {
            await item.destroy();

            return { message: 'Pedido excluído' };
        }
    } catch (e) {
        return { error: 'Erro ao inativar pedido' };
    }
}

const show = async (req) => {
    const { id } = req.params;

    try {
        const item = await Pedido.findByPk(id);

        if (!item) {
            return { error: 'Pedido não encontrado' };
        }

        return item;
    } catch (error) {
        return { error: 'Erro ao buscar pedido' };
    }
}

const indexProdutos = async (req) => {
    try {
        const pedidoId = req.params.id;

        const pedidos = await PedidoProduto.findAll({
            where: { id_pedido: pedidoId }
        });

        if (pedidos.length === 0) {
            return { error: 'Nenhum produto encontrado' };
        }

        return await Promise.all(
            pedidos.map(async (pedido) => {
                const produto = await Produto.findByPk(pedido.id_produto, {
                    attributes: ['nome']
                });

                return {
                    id_produto: pedido.id_produto,
                    nome: produto ? produto.nome : 'Produto não encontrado',
                    quantidade: pedido.quantidade,
                };
            })
        );
    } catch (error) {
        return { error: 'Erro ao buscar produtos' };
    }
}

module.exports = { index, store, update, destroy, show, indexProdutos };