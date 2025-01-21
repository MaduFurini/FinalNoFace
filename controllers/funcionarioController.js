const Usuario = require('../models/usuario');

const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const fs = require('fs');

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
    const { nome, email, cpf, senha, telefone } = req.body;

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
            telefone: telefone,
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
    let { telefone } = req.body;
    const { id } = req.params;

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

        if (telefone !== item.telefone) {
            if (item.email === 'staynofaround@gmail.com') {
                telefone = telefone.replace(/\D/g, '');

                delete process.env.TELEFONE_DEFAULT;

                if (!telefone.startsWith('55')) {
                    process.env.TELEFONE_DEFAULT = '55' + telefone;
                } else {
                    process.env.TELEFONE_DEFAULT = telefone;
                }
            }
        } else {
            delete process.env.TELEFONE_DEFAULT;

            process.env.TELEFONE_DEFAULT = '5519998852902';
        }

        item.nome = nome || item.nome;
        item.email = email || item.email;
        item.cpf = cpf || item.cpf;
        item.status = status === false ? 0 : 1 || item.status;
        item.telefone= telefone || item.telefone;

        if (senha && senha.trim() !== '') {
            item.senha =  await bcrypt.hash(senha, 10);
        }

        item.updatedAt = new Date();

        await item.save();

        const envFilePath = '.env';
        const envFileContent = fs.readFileSync(envFilePath, 'utf8');
        const updatedEnvContent = envFileContent
            .split('\n')
            .filter((line) => !line.startsWith('TELEFONE_DEFAULT='))
            .concat(`TELEFONE_DEFAULT=${process.env.TELEFONE_DEFAULT}`)
            .join('\n');

        fs.writeFileSync(envFilePath, updatedEnvContent, 'utf8');

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

        await item.destroy();

        return { message: 'Funcionário excluído com sucesso' };
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