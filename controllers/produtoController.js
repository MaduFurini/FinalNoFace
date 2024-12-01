const Variacao = require('../models/variacao');
const Produto = require('../models/produto');
const Categoria = require('../models/categoria');
const ProdutoPedido = require('../models/produtoPedido');

const { Op, Sequelize} = require('sequelize');
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
                    },
                    id_referencia: {
                        [Op.is]: null
                    }
                },
                limit: limit,
                offset: offset
            });
            count = result.count;
            itens = result.rows;
        } else {
            const result = await Produto.findAndCountAll({
                where: {
                    id_referencia: {
                        [Op.is]: null
                    }
                },
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

const indexHome = async (req) => {
    try {
        const result = await Produto.findAndCountAll({
            where: {
                status: 1,
                img: {
                    [Op.and]: [
                        { [Op.ne]: null },
                        { [Op.ne]: '' }
                    ]
                },
                id_referencia: {
                    [Op.is]: null
                }
            },
            limit: 3,
            order: [
                [Sequelize.fn('RAND')]
            ]
        });

        const itens = result.rows;
        return { itens };
    } catch (e) {
        return { error: e.message };
    }
};

const indexShop = async (req) => {
    try {
        const produtos = await Produto.findAll({
            where: {
                status: 1,
                id_referencia: {
                    [Op.is]: null
                }
            },
        });

        const categoriaIds = [...new Set(produtos.map(p => p.id_categoria))];

        const categorias = await Categoria.findAll({
            where: {
                id: { [Op.in]: categoriaIds },
            },
        });

        const produtosPorCategoria = categorias.reduce((map, categoria) => {
            map[categoria.id] = produtos.filter(
                produto => produto.id_categoria === categoria.id
            );
            return map;
        }, {});


        return { categorias, produtosPorCategoria };
    } catch (e) {
        return { error: e.message };
    }
};

const indexVariacoes = async (req) => {
    try {
        const produto = await Produto.findByPk(req.params.id);

        const produtosFilhos = await Produto.findAll({
            where: {
                id_referencia: produto.id,
                status: 1
            },
        });

        const variacoesIds = [...new Set(produtosFilhos.map(p => p.id_variacao))];

        const variacoes = await Variacao.findAll({
            where: {
                id: { [Op.in]: variacoesIds },
            },
        });

        if (variacoes) {
            const variacoesMap = variacoes.reduce((map, variacao) => {
                map[variacao.id] = {
                    id: variacao.id,
                    nome: variacao.nome,
                };
                return map;
            }, {});


            return {variacoesMap};
        } else {
            return { message: 'Sucesso'}
        }
    } catch (e) {
        return { error: e.message };
    }
};

const store = async (req) => {
    const { nome, categoria, variacao, descricao, preco, imagem, variacoes } = req.body;

    try {
        const produtoExistente = await Produto.findOne({
            where: {
                [Op.and]: [
                    { nome: { [Op.like]: `%${nome}%` } },
                    { status: 1 }
                ]
            }
        });

        if (produtoExistente) {
            return { error: 'Produto já existente' }
        }

        const produto = await Produto.create({
            id_categoria: parseInt(categoria),
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

        const variacoesArray = JSON.parse(variacoes);
        const variacoesNumericas = variacoesArray.map(Number);

        const idRef = produto.id;

        for (const variacaoNumero of variacoesNumericas) {
            try {
                const produtoFilho = await Produto.create({
                    id_referencia: idRef,
                    id_categoria: produto.id_categoria,
                    id_variacao: variacaoNumero,
                    nome: produto.nome,
                    descricao: produto.descricao,
                    preco: produto.preco,
                    img: produto.img,
                    status: produto.status,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });

            } catch (error) {
                return { error: "Erro ao criar produto" };
            }
        }

        return true;
    } catch (e) {
        return { error: "Erro ao criar produto" };
    }
}

const update = async (req) => {
    const { nome, categoria, descricao, preco, imagem, status, removeImg, variacoes } = req.body;
    const { id } = req.params;

    try {
        const item = await Produto.findByPk(id);

        if (!item) {
            return { error: "Item não encontrado" };
        }

        if (nome) {
            const produtoExistente = await Produto.findOne({
                where: {
                    [Op.and]: [
                        { nome: { [Op.like]: `%${nome}%` } },
                        { status: 1 },
                        { id: { [Op.ne]: id } },
                        { id_referencia: { [Op.ne]: id } }
                    ]
                }
            });

            if (produtoExistente) {
                return { error: 'Produto já existente' }
            }
        }

        item.nome = nome || item.nome;
        item.id_categoria = categoria || item.id_categoria;
        item.descricao = descricao || item.descricao;
        item.preco = preco || item.preco;
        item.status = status === false ? 0 : 1 || item.status;

       if (req.file) {
            const newFileName = `${item.id}${path.extname(req.file.originalname)}`;
            const newFilePath = path.join('public/images/produtos', newFileName);

            fs.renameSync(req.file.path, newFilePath);

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

        const idRef = item.id;
        const img = item.img

        const produtosFilhos = await Produto.findAll({
            where: {
                id_referencia: item.id,
                status: 1
            }
        });

        const variacoesArray = JSON.parse(variacoes);
        const variacoesNumericas = variacoesArray.map(Number);
        const variacoesAtivas = new Set(variacoesNumericas);

        for (const produtoFilho of produtosFilhos) {
            const variacaoId = produtoFilho.id_variacao;

            if (!variacoesAtivas.has(variacaoId)) {
                produtoFilho.status = 0;
                produtoFilho.updatedAt = new Date();
                await produtoFilho.save();
            }
        }

        for (const variacaoNumero of variacoesNumericas) {
            try {
                const verifyProdutoFilho = await Produto.findOne({
                    where: {
                        id_referencia: item.id,
                        id_variacao: variacaoNumero
                    }
                });

                if (!verifyProdutoFilho) {
                    const produtoFilho = await Produto.create({
                        id_referencia: idRef,
                        id_categoria: item.id_categoria,
                        id_variacao: variacaoNumero,
                        nome: item.nome,
                        descricao: item.descricao,
                        preco: item.preco,
                        img: item.img,
                        status: 1,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                } else {
                    verifyProdutoFilho.nome = item.nome;
                    verifyProdutoFilho.descricao = item.descricao;
                    verifyProdutoFilho.preco = item.preco;
                    verifyProdutoFilho.img = item.img;
                    verifyProdutoFilho.status = item.status;
                    verifyProdutoFilho.updatedAt = new Date();

                    await verifyProdutoFilho.save();
                }
            } catch (e) {
                console.error("Erro ao processar a variação:", e.message);
            }
        }

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

        const produtosFilhos = await Produto.findAll({
            where: {
                id_referencia: id
            }
        });

        if (relacao) {
            item.status = 0;
            item.updatedAt = new Date();

            await item.save();

            for (const produtoFilho of produtosFilhos) {
                produtoFilho.status = 0;
                produtoFilho.updatedAt = new Date();

                await produtoFilho.save();
            }

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

            for (const produtoFilho of produtosFilhos) {
                await produtoFilho.destroy();
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

module.exports = { upload, index, store, update, destroy, show, indexHome, indexShop, indexVariacoes };