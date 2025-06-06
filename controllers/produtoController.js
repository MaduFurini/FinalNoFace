const Variacao = require('../models/variacao');
const Produto = require('../models/produto');
const Categoria = require('../models/categoria');
const ProdutoPedido = require('../models/produtoPedido');
const ProdutoImagens = require("../models/produtoImagens");

const { Op, Sequelize} = require('sequelize');
const path = require("path");
const multer = require('multer');
const fs = require("fs");
const upload = require("../config/multerConfig");

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
        const imgIds = itens.map(item => item.id);

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

        const produtosInfo = await Promise.all(itens.map(async (item) => {
            const produtoImagens = await ProdutoImagens.findAll({
                where: { id_produto: item.id }
            });

            const imagens = produtoImagens.map(img => img.img);

            return {
                ...item.dataValues,
                categoria: categoriaMap[item.id_categoria] || 'Categoria não encontrada',
                variacao: variacaoMap[item.id_variacao] || 'Variação não encontrada',
                firstImg: imagens.length > 0 ? imagens[0] : null
            };
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

        const produtosInfo = await Promise.all(itens.map(async (item) => {
            const produtoImagens = await ProdutoImagens.findAll({
                where: { id_produto: item.id }
            });

            const imagens = produtoImagens.map(img => img.img);

            return {
                ...item.dataValues,
                categoria: categoriaMap[item.id_categoria] || 'Categoria não encontrada',
                variacao: variacaoMap[item.id_variacao] || 'Variação não encontrada',
                firstImg: imagens.length > 0 ? imagens[0] : null
            };
        }));

        return { itens: produtosInfo };
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

        const categoriaMap = {};
        categorias.forEach(categoria => {
            categoriaMap[categoria.id] = categoria.nome;
        });

        const produtosPorCategoria = await Promise.all(categorias.map(async (categoria) => {
            const produtosDaCategoria = produtos.filter(
                produto => produto.id_categoria === categoria.id
            );

            const produtosComImagens = await Promise.all(produtosDaCategoria.map(async (produto) => {
                const produtoImagens = await ProdutoImagens.findAll({
                    where: { id_produto: produto.id }
                });

                const imagens = produtoImagens.map(img => img.img);
                return {
                    ...produto.dataValues,
                    categoria: categoriaMap[produto.id_categoria] || 'Categoria não encontrada',
                    firstImg: imagens.length > 0 ? imagens[0] : null
                };
            }));

            return { categoria, produtosComImagens };
        }));

        const produtosPorCategoriaMap = produtosPorCategoria.reduce((map, { categoria, produtosComImagens }) => {
            map[categoria.id] = produtosComImagens;
            return map;
        }, {});

        return { categorias, produtosPorCategoria: produtosPorCategoriaMap };
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
    const { nome, categoria, variacao, descricao, preco, variacoes } = req.body;

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
            return { error: 'Produto já existente' };
        }

        const produto = await Produto.create({
            id_categoria: parseInt(categoria),
            nome: nome,
            descricao: descricao,
            preco: preco,
            status: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const pastaProduto = path.join('public/images/produtos', String(produto.id));

        if (!fs.existsSync(pastaProduto)) {
            fs.mkdirSync(pastaProduto, { recursive: true });
        }

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const newFilePath = path.join(pastaProduto, file.filename);

                fs.renameSync(file.path, newFilePath);

                await ProdutoImagens.create({
                    id_produto: produto.id,
                    img: `/images/produtos/${produto.id}/${file.filename}`,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
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
};

const update = async (req) => {
    const { nome, categoria, descricao, preco, status, removerImagens, variacoes } = req.body;
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
                return { error: 'Produto já existente' };
            }
        }

        item.nome = nome || item.nome;
        item.id_categoria = categoria || item.id_categoria;
        item.descricao = descricao || item.descricao;
        item.preco = preco || item.preco;
        item.status = status === false ? 0 : 1 || item.status;

        const pastaProduto = path.join('public/images/produtos', String(item.id));

        if (!fs.existsSync(pastaProduto)) {
            fs.mkdirSync(pastaProduto, { recursive: true });
        }

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const newFilePath = path.join(pastaProduto, file.filename);

                fs.renameSync(file.path, newFilePath);

                await ProdutoImagens.create({
                    id_produto: item.id,
                    img: `/images/produtos/${item.id}/${file.filename}`,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }

        if (removerImagens) {
            let imagensArray = Array.isArray(removerImagens) ? removerImagens : JSON.parse(removerImagens);

            for (let imgPath of imagensArray) {
                const imagePath = path.join('public', imgPath);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }

                await ProdutoImagens.destroy({
                    where: {
                        id_produto: id,
                        img: imgPath
                    }
                });
            }
        }

        item.updatedAt = new Date();
        await item.save();

        const idRef = item.id;
        const produtosFilhos = await Produto.findAll({
            where: {
                id_referencia: item.id
            }
        });

        if (status != null) {
            for (const produtoFilho of produtosFilhos) {
                produtoFilho.status = item.status;
                produtoFilho.updatedAt = new Date();
                await produtoFilho.save();
            }
        }

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
                let verifyProdutoFilho = await Produto.findOne({
                    where: {
                        id_referencia: item.id,
                        id_variacao: variacaoNumero
                    }
                });

                if (!verifyProdutoFilho) {
                    verifyProdutoFilho = await Produto.create({
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
                }

            } catch (e) {
                return { error: "Erro ao atualizar produto" };
            }
        }

        return true;
    } catch (e) {
        return { error: "Erro ao atualizar produto" };
    }
};

const destroy = async (req) => {
    const { id } = req.params;

    try {
        const item = await Produto.findByPk(id);

        if (!item) {
            return { error: 'Variação não encontrada' };
        }

        const produtosFilhos = await Produto.findAll({
            where: {
                id_referencia: id
            }
        });

        const relacoes = await Promise.all(produtosFilhos.map(async (produto) => {
            return await ProdutoPedido.findOne({
                where: {
                    id_produto: produto.id
                }
            });
        }));

        const hasRelation = relacoes.some(relacao => relacao !== null);

        if (hasRelation) {
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
            const imgProdutos = await ProdutoImagens.findAll({
                where: {
                    id_produto: item.id
                }
            });

            for (const img of imgProdutos) {
                const imgPath = path.join('public', img.img);
                const directoryPath = path.join('public/images/produtos/', String(item.id));

                if (fs.existsSync(imgPath)) {
                    const stats = fs.statSync(imgPath);

                    if (stats.isDirectory()) {
                        fs.rmSync(imgPath, { recursive: true, force: true });
                    } else {
                        fs.unlinkSync(imgPath);
                    }
                }

                if (fs.existsSync(directoryPath)) {
                    const stats = fs.statSync(directoryPath);

                    if (stats.isDirectory() && fs.readdirSync(directoryPath).length === 0) {
                        fs.rmdirSync(directoryPath);
                    }
                }
                await ProdutoImagens.destroy({
                    where: {
                        id: img.id
                    }
                });
            }

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

        const produtoImagens = await ProdutoImagens.findAll({
            where: { id_produto: item.id }
        });

        const imagens = produtoImagens.map(img => img.img);

        return {
            ...item.dataValues,
            categoria: categoria ? categoria.nome : 'Categoria não encontrada',
            variacao: variacao ? variacao.nome : 'Variação não encontrada',
            imagens: imagens.length > 0 ? imagens : ['Nenhuma imagem disponível'],
            firstImg: imagens.length > 0 ? imagens[0] : null
        };
    } catch (error) {
        return { error: 'Erro ao buscar produto' };
    }
};

const showShop = async (req) => {
    const id  = req.session.data.parameter;

    try {
        const item = await Produto.findByPk(id);

        if (!item) {
            return { error: 'Produto não encontrado' };
        }

        const categoria = await Categoria.findByPk(item.id_categoria);

        const produtosFilhos = await Produto.findAll({
            where: { id_referencia: id, status: 1 }
        });

        const idsVariacoes = produtosFilhos.map(filho => filho.id_variacao);

        const variacoesEncontradas = await Variacao.findAll({
            where: { id: idsVariacoes }
        });

        const mapaVariacoes = {};
        variacoesEncontradas.forEach(variacao => {
            mapaVariacoes[variacao.id] = variacao;
        });

        const variacoes = produtosFilhos.map(filho => ({
            id: filho.id_variacao,
            nome: mapaVariacoes[filho.id_variacao]
                ? mapaVariacoes[filho.id_variacao].nome
                : 'Variação não encontrada',
            preco: filho.preco,
            img: filho.img
        }));

        const produtoImagens = await ProdutoImagens.findAll({
            where: { id_produto: item.id }
        });

        const imagens = produtoImagens.map(img => img.img);

        return {
            ...item.dataValues,
            categoria: categoria ? categoria.nome : 'Categoria não encontrada',
            variacoes: variacoes.length > 0 ? variacoes : 'Sem variações disponíveis',
            imagens: imagens.length > 0 ? imagens : ['Nenhuma imagem disponível'],
            firstImg: imagens.length > 0 ? imagens[0] : null
        };
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        return { error: 'Erro ao buscar produto' };
    }
};


module.exports = { upload, index, store, update, destroy, show, indexHome, indexShop, indexVariacoes, showShop };