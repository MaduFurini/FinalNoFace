const Pedido = require('../models/pedido');
const PedidoProduto = require('../models/produtoPedido');
const Produto = require('../models/produto');
const Categoria = require('../models/categoria');
const Variacao = require('../models/variacao');

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
    const { carrinho } = req.body;

    try {
        const prefix = "NFC";
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        let codigoUnico = false;
        let codigoGerado = "";

        // Gerar código único para o pedido
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

        const pedido = await Pedido.create({
            codigo: codigoGerado,
            status: 'Realizado',
            valorTotal: carrinho.valorTotal,
            pago: 0,
            exibirRelatorio: 0,
            contato: carrinho.contato,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        for (let item of carrinho.produtos) {
            const produto = await Produto.findOne({
                where: {
                    id_referencia: item.produto,
                    id_variacao: item.variacao
                }
            });

            if (produto) {
                await ProdutoPedido.create({
                    id_produto: produto.id,
                    id_pedido: pedido.id,
                    quantidade: item.quantidade,
                    status: 1,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }

        return {
            codigo: codigoGerado
        };

    } catch (e) {
        return { error: "Erro ao listar pedidos" };
    }
}

const update = async (req) => {
    const { status, obs, formaPag, contato, exibir } = req.body;
    const { id } = req.params;

    try {
        const item = await Pedido.findByPk(id);

        if (!item) {
            return { error: "Item não encontrado" };
        }

        item.status = status || item.status;
        item.observacao = (obs !== '') ? obs : item.observacao;
        item.formaPagamento = (formaPag !== 'Indefinido') ? formaPag : item.formaPagamento;
        item.contato = (contato && contato !== item.contato) ? contato : item.contato;
        item.exibirRelatorio = exibir === true ? 1 : 0;

        item.updatedAt = new Date();

        await item.save();

      return true;
    } catch (e) {
        return { error: "Erro ao atualizar pedido" };
    }
}

const destroy = async (req) => {
    const { id } = req.params;

    try {
        const item = await Pedido.findByPk(id);

        if (!item) {
            return { error: 'Pedido não encontrado' };
        }

        await item.destroy();

        return { message: 'Pedido excluído' };
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
                const produto = await Produto.findByPk(pedido.id_produto);

                const variacao = await Variacao.findByPk(produto.id_variacao);

                return {
                    id_produto: pedido.id_produto,
                    nome: produto ? produto.nome : 'Produto não encontrado',
                    preco: produto.preco,
                    variacao: variacao.nome,
                    quantidade: pedido.quantidade,
                };
            })
        );
    } catch (error) {
        return { error: 'Erro ao buscar produtos' };
    }
}

const relatorioProdutos = async (req) => {
    let { dataInicio, dataFim } = req.body;

    try {
        // Certifica-se de que dataInicio e dataFim são objetos Date
        dataInicio = new Date(dataInicio);
        dataFim = new Date(dataFim);

        // Ajusta o horário para o intervalo completo do dia
        dataInicio.setHours(0, 0, 0, 0);  // Definindo hora como 00:00:00
        dataFim.setHours(23, 59, 59, 999);  // Definindo hora como 23:59:59.999

        // Subtrai 3 horas para o fuso horário de Brasília (ou outro fuso desejado)
        dataInicio.setHours(dataInicio.getHours() - 3);
        dataFim.setHours(dataFim.getHours() - 3);

        // Formata as datas no formato correto para SQL (YYYY-MM-DD HH:mm:ss)
        const formatDateForDatabase = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        };

        const formattedDataInicio = formatDateForDatabase(dataInicio);
        const formattedDataFim = formatDateForDatabase(dataFim);

        const pedidos = await Pedido.findAll({
            where: {
                createdAt: {
                    [Op.between]: [formattedDataInicio, formattedDataFim]
                }
            }
        });

        const pedidosComProdutos = await Promise.all(
            pedidos.map(async (pedido) => {
                const produtosPedido = await PedidoProduto.findAll({
                    where: { id_pedido: pedido.id }
                });

                const produtosDetalhados = await Promise.all(
                    produtosPedido.map(async (produtoPedido) => {
                        const produto = await Produto.findByPk(produtoPedido.id_produto);

                        const categoria = produto ? await Categoria.findByPk(produto.id_categoria) : null;
                        const variacao = produto ? await Variacao.findByPk(produto.id_variacao) : null;

                        return {
                            nome: produto ? produto.nome : 'Produto não encontrado',
                            imagem: produto ? produto.imagem : null,
                            variacao: variacao ? variacao.nome : 'Variação não encontrada',
                            categoria: categoria ? categoria.nome : 'Categoria não encontrada',
                            valor: pedido.valorTotal,
                            quantidade: produtoPedido.quantidade,
                            preco: produto.preco
                        };
                    })
                );

                return {
                    pedido,
                    produtos: produtosDetalhados
                };
            })
        );

        return pedidosComProdutos;
    } catch (error) {
        return { error: 'Erro ao buscar pedidos ou produtos.' };
    }
};


module.exports = { index, store, update, destroy, show, indexProdutos, relatorioProdutos };