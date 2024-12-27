const express = require('express');
const router = express.Router();

const {
    login,
    sair,
    forgotPassword,
    resetPassword,
    newPassword
} = require('../../controllers/loginController')

router.get('/', async (req, res) => {
    const { error } = req.body || req.query || null;

    res.render('login/login', { error: error });
});

router.post('/entrar', async (req, res) => {
    try {
        const response = await login(req);

        if (response.user && response.token) {
            res.cookie('token', response.token, { httpOnly: true });

            return res.redirect('/noFace/admin/pedidos');
        }

        res.render('login/login', { error: 'Erro ao autenticar usuário. Verifique os dados e tente novamente.' });
    } catch (error) {
        res.render('login/login', { error: error.message || 'Erro inesperado. Por favor, tente novamente mais tarde.' });
    }
});

router.get('/sair', async (req, res) => {
    await sair(req, res);
});

router.get('/forgotPassword', async (req, res) => {
    const { error } = req.body || req.query || null;

    res.render('login/forgotPassword', { error: error });});

router.post('/forgotPassword', async (req, res) => {
    await forgotPassword(req, res);
});

router.get('/resetPassword', async (req, res) => {
    const { error } = req.body || req.query || null;

    res.render('login/resetPassword', { error: error });
});

router.post('/resetPassword', async (req, res) => {
    await resetPassword(req, res);
});

router.get('/newPassword', async (req, res) => {
    const { error } = req.body || req.query || null;

    res.render('login/newPassword', { error: error });
});

router.post('/newPassword', async (req, res) => {
    await newPassword(req, res);
});

module.exports = router;
