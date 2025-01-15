const Usuario = require('../models/usuario');
const Token = require('../models/personalAccessTokens');
const PersonalAccessTokens = require('../models/personalAccessTokens');

const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");

require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;
const EMAIL = process.env.EMAIL_DEFAULT;
const SENHA = process.env.EMAIL_PASSWORD;

const decodedKey = Buffer.from(SECRET_KEY, 'base64');
const key = decodedKey.length === 32 ? decodedKey : crypto.createHash('sha256').update(decodedKey).digest();
const iv = crypto.randomBytes(16);

const transporter = nodemailer.createTransport({
    service: 'zoho',
    auth: {
        user: EMAIL,
        pass: SENHA
    }
});

const sendOtpEmail = (to, otp) => {
    const mailOptions = {
        from: EMAIL,
        to: to,
        subject: 'NoFace - Recuperação de Senha',
        text: `Seu código para recuperação de senha é: ${otp}`
    };

    return transporter.sendMail(mailOptions);
};

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000);
};

const login = async (req) => {
    const { email, senha } = req.body;

    try {
        const user = await Usuario.findOne({ where: { email } });

        if (!user) {
            return { error: "Usuário não encontrado" };
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

        const token = jwt.sign({ id: user.id, tipo_usuario: user.tipo_usuario }, SECRET_KEY, { expiresIn: '1h' });
        const expiresAt = new Date(Date.now() + 3600 * 1000 - 3 * 60 * 60 * 1000);

        const tokenInstance = await PersonalAccessTokens.create({
            id_usuario: user.id,
            tipo_usuario: user.tipo_usuario.charAt(0).toUpperCase() + user.tipo_usuario.slice(1),
            token: token,
            expires_at: expiresAt,
        });

        const encryptedData = encrypt(user.id.toString());

        req.session.user = {
            data: encryptedData.encryptedData,
            iv: encryptedData.iv,
            tipo_usuario: user.tipo_usuario,
        };


        return { user: user, token: tokenInstance.token };
    } catch (error) {
        return { error: "Erro ao autenticar usuário" };
    }
};

const sair = async (req, res) => {
    const idUser = decrypt(req.session.user.data, req.session.user.iv);

    const token = await Token.findOne({
        where: {
            id_usuario: idUser
        }
    });

    if (token) {
        await token.destroy();
    }

    req.session.user = null;

    res.clearCookie('token', { httpOnly: true });
    res.redirect('/noFace/home');
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    const otp = generateOtp();

    req.session.user = null;

    res.clearCookie('token', { httpOnly: true });

    try {
        const user = await Usuario.findOne({
            where: { email: email }
        });

        if (user) {
            await user.update({
                otp: otp,
                otp_expiresAt:  new Date(Date.now() + 15 * 60 * 1000)
            });

            sendOtpEmail(email, otp);

            const encryptedData = encrypt(user.id.toString());

            req.session.user = {
                data: encryptedData.encryptedData,
                iv: encryptedData.iv,
                tipo_usuario: user.tipo_usuario,
            };

            return res.redirect(`/noFace/login/resetPassword`);
        }

        return res.redirect('/noFace/login?error=Usuário não encontrado');
    } catch (error) {
        return res.redirect('/noFace/login?error=Erro ao enviar email');
    }
};

const resetPassword = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/noFace/login?error=Tente novamente');
    }

    const idUser = decrypt(req.session.user.data, req.session.user.iv);

    const { code } = req.body;

    try {
        const usuario = await Usuario.findByPk(idUser);

        if (usuario.otp.toString() === code) {
            await Usuario.update(
                { otp: null },
                { where: { id: usuario.id } }
            );

            return res.redirect(`/noFace/login/newPassword`);
        } else {
            return res.redirect('/noFace/login?error=Código não corresponde');
        }


    } catch (error) {
        return res.redirect('/noFace/login?error=Email não encontrado');
    }
};

const newPassword = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/noFace/login?error=Tente novamente');
    }

    const idUser = decrypt(req.session.user.data, req.session.user.iv);

    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.redirect('/noFace/login?error=Senhas não conferem');
    }

    try {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(confirmPassword, salt);

        const usuario = await Usuario.findByPk(idUser);

        if (usuario) {
            await usuario.update(
                { senha: hash, otp: null }
            );

            const token = jwt.sign({ id: usuario.id, email: usuario.email }, SECRET_KEY, {
                expiresIn: '1h'
            });

            return res.redirect('/noFace/login');
        }

        return res.redirect('/noFace/login?error=Usuário não encontrado');

    } catch (e) {
        return res.redirect('/noFace/login?error=Erro ao atulizar senha');
    }
};


function encrypt(text) {
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');

    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted
    };
}

function decrypt(encryptedData, iv) {
    const ivBuffer = Buffer.from(iv, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, ivBuffer);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
}

module.exports = { login, sair, forgotPassword, resetPassword, newPassword };
