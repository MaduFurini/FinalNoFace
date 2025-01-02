const jwt = require('jsonwebtoken');
const Token = require('../models/personalAccessTokens');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;

const authMiddleware = async (req, res, next) => {
    const cookies = req.headers.cookie;

    if (!cookies) {
        return res.redirect('/noFace/login?error=Usuário não autenticado');
    }

    const cookiesArray = cookies.split('; ');

    const tokenCookie = cookiesArray.find(cookie => cookie.startsWith('token='));

    if (!tokenCookie) {
        return res.redirect('/noFace/login?error=Usuário não autenticado');
    }

    const token = tokenCookie.split('=')[1];

    if (!token) {
        return res.redirect('/noFace/login?error=Usuário não autenticado');
    }

    try {
        const decoded = await jwt.verify(token, SECRET_KEY);

        const tokenDb = await Token.findOne({
            where: {
                token: token
            }
        });

        if (!tokenDb) {
            return res.redirect('/noFace/login?error=?error=Usuário não autenticado');
        }

        const expiresAtFromDb = tokenDb.expires_at;
        const currentDate = new Date();
        const currentDateUtcMinus3 = new Date(currentDate.setHours(currentDate.getHours() - 3));

        if (new Date(expiresAtFromDb) < currentDateUtcMinus3) {
            return res.redirect('/noFace/login?error=Usuário não autenticado');
        }

        req.user = decoded;

        next();
    } catch (err) {
        return res.redirect('/noFace/login?error=Sessão expirada, faça login novamente');
    }
};

const verifyUserAbility = async (req, res, next) => {
    const cookies = req.headers.cookie;

    if (!cookies) {
        return res.redirect('/noFace/login?error=Usuário não possui permissão para acessar essa página');
    }

    const cookiesArray = cookies.split('; ');

    const tokenCookie = cookiesArray.find(cookie => cookie.startsWith('token='));
    const token = tokenCookie.split('=')[1];

    if (!token) {
        return res.redirect('/noFace/login?error=Usuário não possui permissão para acessar essa página');
    }

    const tokenDb = await Token.findOne({
        where: {
            token: token
        }
    })

    if (tokenDb) {
        if (tokenDb.tipo_usuario === 'admin') {
            next();
        } else {
            return res.redirect('/noFace/login?error=Usuário não possui permissão para acessar essa página');
        }
    }
};

const noCache = (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
};

module.exports = { authMiddleware, verifyUserAbility, noCache };
