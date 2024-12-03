const Usuario = require('../models/usuario');
const PersonalAccessTokens = require('../models/personalAccessTokens');

const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

        const user = await Usuario.create({
            nome: nome,
            email: email,
            senha: senhaHasheada,
            cpf: cpf,
            tipo_usuario: 'cliente',
            status: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const tokenExistence = await PersonalAccessTokens.findOne({
            where: {
                id_usuario: user.id,
                tipo_usuario: user.tipo_usuario,
            },
        });

        if (tokenExistence) {
            await tokenExistence.destroy();
        }

        const token = jwt.sign({ id: user.id, tipo_usuario: user.tipo_usuario }, 'exerIsTGHyhAPfuWDgjqWw', { expiresIn: '1h' });
        const expiresAt = new Date(Date.now() + 3600 * 1000 - 3 * 60 * 60 * 1000);

        const tokenInstance = await PersonalAccessTokens.create({
            id_usuario: user.id,
            tipo_usuario: user.tipo_usuario,
            token: token,
            expires_at: expiresAt,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return { user: user, token: tokenInstance.token };
    } catch (e) {
        return { error: "Erro ao criar cliente" };
    }
}

const login = async (req) => {
    const { email, senha } = req.body;

    try {
        const user = await Usuario.findOne({ where: { email } });

        if (!user) {
            return { error: "Erro ao criar cliente" };
        }

        const senhaValida = await bcrypt.compare(senha, user.senha);

        if (!senhaValida) {
            return { error: "Senha inválida" };
        }

        const tokenExistence = await PersonalAccessTokens.findOne({
            where: {
                id_usuario: user.id,
                tipo_usuario: user.tipo_usuario,
            },
        });

        if (tokenExistence) {
            await tokenExistence.destroy();
        }

        const token = jwt.sign({ id: user.id, tipo_usuario: user.tipo_usuario }, 'exerIsTGHyhAPfuWDgjqWw', { expiresIn: '1h' });
        const expiresAt = new Date(Date.now() + 3600 * 1000 - 3 * 60 * 60 * 1000);

        const tokenInstance = await PersonalAccessTokens.create({
            id_usuario: user.id,
            tipo_usuario: user.tipo_usuario.charAt(0).toUpperCase() + user.tipo_usuario.slice(1),
            token: token,
            expires_at: expiresAt,
        });

        req.session.user = {
            id: user.id,
            tipo_usuario: user.tipo_usuario,
        };

        return { user: user, token: tokenInstance.token };
    } catch (error) {
        return { error: "Erro ao autenticar cliente" };
    }
}

const show = async (req) => {
    const { id } = req.params;

    try {
        const item = await Usuario.findByPk(id);

        if (!item) {
            return { error: 'Cliente não encontrado' };
        }

        return item;
    } catch (error) {
        return { error: 'Erro ao buscar cliente' };
    }
}

module.exports = { store, login };