const Variacao = require('../models/variacao');
const Produto = require('../models/produto');

const { Op } = require('sequelize');

const index = async (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    const searchTerm = req.query.nome || '';

    let itens = null;
    let count = null;

    try {
        if (searchTerm) {
            const result = await Variacao.findAndCountAll({
                where: {
                    nome: {
                        [Op.like]: `%${searchTerm}%`
                    }
                },
                limit: limit,
                offset: offset
            });
            count = result.count;
            itens = result.rows;
        } else {
            const result = await Variacao.findAndCountAll({
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
    const { nome, descricao } = req.body;

    try {
        const variacao = await Variacao.create({
            nome: nome,
            descricao: descricao,
            status: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return true;
    } catch (e) {
        return { error: "Erro ao listar variações" };
    }
}

const update = async (req) => {
    const { nome, descricao, status } = req.body;
    const { id } = req.params;

    try {
        const item = await Variacao.findByPk(id);

        if (!item) {
            return { error: "Item não encontrado" };
        }

        item.nome = nome || item.nome;
        item.descricao = descricao || item.descricao;
        item.status = status === false ? 0 : 1 || item.status;

        item.updatedAt = new Date();

        await item.save();

        return true;
    } catch (e) {
        return { error: "Erro ao atualizar status" };
    }
}

const destroy = async (req) => {
    const { id } = req.params;

    try {
        const item = await Variacao.findByPk(id);

        if (!item) {
            return { error: 'Variação não encontrada' };
        }

        const relacao = await Produto.findOne({
            where: {
                id_variacao: id
            }
        });

        if (relacao) {
            item.status = 0;
            item.updatedAt = new Date();

            await item.save();

            return { message: 'Variação inativada devido a vínculos existentes' };
        } else {
            await item.destroy();

            return { message: 'Variação excluída' };
        }
    } catch (e) {
        return { error: 'Erro ao excluir variação' };
    }
}

const show = async (req) => {
    const { id } = req.params;

    try {
        const item = await Variacao.findByPk(id);

        if (!item) {
            return { error: 'Variação não encontrada' };
        }

        return item;
    } catch (error) {
        return { error: 'Erro ao buscar variação' };
    }
}

module.exports = { index, store, update, destroy, show };