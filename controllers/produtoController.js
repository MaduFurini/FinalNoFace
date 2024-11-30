const Variacao = require('../models/variacao');
const Produto = require('../models/produto');
const Categoria = require('../models/categoria');
const ProdutoPedido = require('../models/produtoPedido');

const { Op } = require('sequelize');
const path = require("path");
const multer = require('multer');
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/produtos');
    },
    filename: function (req, file, cb) {
        const tempFileName = 'temp_' + Date.now() + path.extname(file.originalname);
        cb(null, tempFileName);
    }
});

const upload = multer({ storage: storage });

const index = async (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    const searchTerm = req.query.nome || '';

    let itens = null;
    let count = null;

    try {
        if (searchTerm) {
            const result = await Produto.findAndCountAll({
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
            const result = await Produto.findAndCountAll({
                limit: limit,
                offset: offset
            });
            count = result.count;
            itens = result.rows;
        }

        const totalPages = Math.ceil(count / limit);

        const categoriaIds = itens.map(item => item.id_categoria);
        const variacoesIds = itens.map(item => item.id_variacao);

        const categorias = await Categoria.findAll({
            where: {
                id: categoriaIds
            }
        });

        const variacoes = await Variacao.findAll({
            where: {
                id: variacoesIds
            }
        });

        const categoriaMap = {};
        categorias.forEach(categoria => {
            categoriaMap[categoria.id] = categoria.nome;
        });

        const variacaoMap = {};
        variacoes.forEach(variacao => {
            variacaoMap[variacao.id] = variacao.nome;
        });

        const produtosInfo = itens.map(item => ({
            ...item.dataValues,
            categoria: categoriaMap[item.id_categoria] || 'Categoria não encontrada',
            variacao: variacaoMap[item.id_variacao] || 'Variação não encontrada'
        }));


        return { itens: produtosInfo, currentPage: page, totalPages };
    } catch (e) {
        return { error: e.message };
    }
};


const store = async (req) => {
    const { nome, categoria, variacao, descricao, preco, imagem } = req.body;

    try {
        const produto = await Produto.create({
            id_categoria: parseInt(categoria),
            id_variacao: parseInt(variacao),
            nome: nome,
            descricao: descricao,
            preco: preco,
            img: '',
            status: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        if (req.file) {
            const newFileName = `${produto.id}${path.extname(req.file.originalname)}`;
            const newFilePath = path.join('public/images/produtos', newFileName);

            fs.renameSync(req.file.path, newFilePath);

            produto.img = `/images/produtos/${newFileName}`;
            await produto.save();
        }

        return true;
    } catch (e) {
        console.log(e.message)
        return { error: "Erro ao criar produto" };
    }
}

const update = async (req) => {
    console.log(123)
    const { nome, categoria, variacao, descricao, preco, imagem, status, removeImg } = req.body;
    const { id } = req.params;

    try {
        const item = await Produto.findByPk(id);

        if (!item) {
            return { error: "Item não encontrado" };
        }

        item.nome = nome || item.nome;
        item.id_categoria = categoria || item.id_categoria;
        item.id_variacao = variacao || item.id_variacao;
        item.descricao = descricao || item.descricao;
        item.preco = preco || item.preco;
        item.status = status === false ? 0 : 1 || item.status;

        if (imagem) {
            const newFileName = `${item.id}${path.extname(imagem.originalname)}`;
            const newFilePath = path.join('public/images/produtos', newFileName);

            fs.renameSync(imagem.path, newFilePath);

            item.img = `/images/produtos/${newFileName}`;
            await item.save();
        }

        if (removeImg) {
            if (item.img) {
                const imagePath = path.join('public', item.img);

                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }

                item.img = null;
                await item.save();
            }
        }

        item.updatedAt = new Date();

        await item.save();

        return true;
    } catch (e) {
        return { error: "Erro ao atualizar produto" };
    }
}

const destroy = async (req) => {
    const { id } = req.params;

    try {
        const item = await Produto.findByPk(id);

        if (!item) {
            return { error: 'Variação não encontrada' };
        }

        const relacao = await ProdutoPedido.findOne({
            where: {
                id_produto: id
            }
        });

        if (relacao) {
            item.status = 0;
            item.updatedAt = new Date();

            await item.save();

            return { message: 'Produto inativado devido a vínculos existentes' };
        } else {
            if (item.img) {
                const imagePath = path.join('public', item.img);

                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }

                item.img = null;
                await item.save();
            }

            await item.destroy();

            return { message: 'Produto excluído' };
        }
    } catch (e) {
        return { error: 'Erro ao excluir produto' };
    }
}

const show = async (req) => {
    const { id } = req.params;

    try {
        const item = await Produto.findByPk(id);

        if (!item) {
            return { error: 'Produto não encontrado' };
        }

        const categoria = await Categoria.findByPk(item.id_categoria);
        const variacao = await Variacao.findByPk(item.id_variacao);

        return {
            ...item.dataValues,
            categoria: categoria ? categoria.nome : 'Categoria não encontrada',
            variacao: variacao ? variacao.nome : 'Variação não encontrada'
        };
    } catch (error) {
        return { error: 'Erro ao buscar produto' };
    }
}

module.exports = { upload, index, store, update, destroy, show };