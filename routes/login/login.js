const express = require('express');
const router = express.Router();

const {
    store,
    login
} = require('../../controllers/loginController')


router.get('/', async (req, res) => {
    const { error } = req.body || null;

    res.render('login/login', { error: error });
});

router.post('/newUser', async (req, res) => {
    try {
        const response = await store(req);

        if (response.user && response.token) {
            req.session.user = {
                id: response.user.id,
                tipo_usuario: response.user.tipo_usuario,
            };

            res.cookie('token', response.token, { httpOnly: true });

            return res.redirect('/noFace/');
        }

        res.render('login/login', { error: 'Erro ao autenticar usuário. Verifique os dados e tente novamente.' });
    } catch (error) {
        res.render('login/login', { error: error.message || 'Erro inesperado. Por favor, tente novamente mais tarde.' });
    }
});

router.post('/entrar', async (req, res) => {
    try {
        const response = await login(req);

        if (response.user && response.token) {
            req.session.user = {
                id: response.user.id,
                tipo_usuario: response.user.tipo_usuario,
            };

            res.cookie('token', response.token, { httpOnly: true });

            return res.redirect('/noFace/');
        }

        res.render('login/login', { error: 'Erro ao autenticar usuário. Verifique os dados e tente novamente.' });
    } catch (error) {
        res.render('login/login', { error: error.message || 'Erro inesperado. Por favor, tente novamente mais tarde.' });
    }
});

router.get('/sair', async (req, res) => {
    res.clearCookie('token', { httpOnly: true });
    req.session.user = null;

    res.redirect('/noFace/home');
});




module.exports = router;
