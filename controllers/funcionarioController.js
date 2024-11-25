const Usuario = require('../models/usuario');

const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

const index = async (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    const searchTerm = req.query.nome || '';

    let itens = null;
    let count = null;

    try {
        if (searchTerm) {
            const result = await Usuario.findAndCountAll({
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
            const result = await Usuario.findAndCountAll({
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
    const { nome, email, cpf, senha } = req.body;

    try {
        const usuario = await Usuario.findOne({
            where: {
                [Op.or]: [
                    { email: email },
                    { cpf: cpf }
                ]
            }
        });

        if (usuario) {
            let message;

            if (usuario.email === email) {
                message = 'Email já existente';
            } else {
                message = 'CPF já existente';
            }

            return { error: message }
        }

        const senhaHasheada = await bcrypt.hash(senha, 10);

        await Usuario.create({
            nome: nome,
            email: email,
            senha: senhaHasheada,
            cpf: cpf,
            tipo_usuario: 'admin',
            status: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return true;
    } catch (e) {
        return { error: "Erro ao listar funcionários" };
    }
}

const update = async (req) => {
    const { nome, email, cpf, senha, status } = req.body;
    const { id } = req.params;

    console.log(senha);
    console.log(req.body)
    try {
        const item = await Usuario.findByPk(id);

        if (!item) {
            return { error: "Item não encontrado" };
        }

        if (email || cpf) {
            const user = await Usuario.findOne({
                where: {
                    [Op.or]: [
                        { email: email },
                        { cpf: cpf }
                    ],
                    id: { [Op.ne]: id }
                }
            });

            if (user) {
                let message;
                if (user.email === email) {
                    message = 'Email já existente';
                } else {
                    message = 'CPF já existente';
                }
                return { error: message };
            }
        }

        item.nome = nome || item.nome;
        item.email = email || item.email;
        item.cpf = cpf || item.cpf;
        item.status = status === false ? 0 : 1 || item.status;

        if (senha && senha.trim() !== '') {
            item.senha =  await bcrypt.hash(senha, 10);
        }

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
        const item = await Usuario.findByPk(id);

        if (!item) {
            return { error: 'Funcionário não encontrado' };
        }

        item.status = 0;
        item.updatedAt = new Date();

        await item.save();

        return { message: 'Funcionário inativado com sucesso' };
    } catch (e) {
        return { error: 'Erro ao inativar usuário' };
    }
}

const show = async (req) => {
    const { id } = req.params;

    try {
        const item = await Usuario.findByPk(id);

        if (!item) {
            return { error: 'Funcionário não encontrado' };
        }

        return item;
    } catch (error) {
        return { error: 'Erro ao buscar funcionário' };
    }
}

module.exports = { index, store, update, destroy, show };