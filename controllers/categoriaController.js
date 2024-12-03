const Categoria = require('../models/categoria');
const Produto = require('../models/produto');

const { Op } = require('sequelize');

const index = async (req) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    const searchTerm = req.query.nome || '';
    const status = req.query.status;

    try {
        const where = {};
        if (status != null) {
            where.status = status;
        }

        if (searchTerm) {
            where.nome = { [Op.like]: `%${searchTerm}%` };
        }

        const result = await Categoria.findAndCountAll({
            where,
            limit,
            offset,
        });

        const totalPages = Math.ceil(result.count / limit);

        return { itens: result.rows, currentPage: page, totalPages };
    } catch (e) {
        return { error: e.message };
    }
};

const store = async (req) => {
    const { nome, descricao } = req.body;

    try {
        const variacao = await Categoria.create({
            nome: nome,
            descricao: descricao,
            status: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return true;
    } catch (e) {
        return { error: "Erro ao listar categorias" };
    }
}

const update = async (req) => {
    const { nome, descricao, status } = req.body;
    const { id } = req.params;

    try {
        const item = await Categoria.findByPk(id);

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
        const item = await Categoria.findByPk(id);

        if (!item) {
            return { error: 'Categoria não encontrada' };
        }

        const relacao = await Produto.findOne({
            where: {
                id_categoria: id
            }
        });

        if (relacao) {
            item.status = 0;
            item.updatedAt = new Date();

            await item.save();

            return { message: 'Categoria inativada devido a vínculos existentes' };
        } else {
            await item.destroy();

            return { message: 'Categoria excluída' };
        }
    } catch (e) {
        return { error: 'Erro ao excluir categoria' };
    }
}

const show = async (req) => {
    const { id } = req.params;

    try {
        const item = await Categoria.findByPk(id);

        if (!item) {
            return { error: 'Categoria não encontrada' };
        }

        return item;
    } catch (error) {
        return { error: 'Erro ao buscar variação' };
    }
}

module.exports = { index, store, update, destroy, show };