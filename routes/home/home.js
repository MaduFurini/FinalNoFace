const express = require('express');
const router = express.Router();

const {
    indexHome,
    indexShop,
    showShop
} = require('../../controllers/produtoController')


router.get('/', async (req, res) => {
    const response = await indexHome(req);
    const user = req.session || null;

    if (response.error) {
        return res.status(500).json({ message: response.error });
    }

    res.render('home/home', {
        itens: response.itens,
        user: user
    });
});

router.get('/shop', async (req, res) => {
    const { categorias, produtosPorCategoria } = await indexShop(req, res);

    res.render('home/shop', { categorias, produtosPorCategoria });
});

router.get('/produto', async (req, res) => {
    const response = await showShop(req, res);

    res.render('home/produto', { produto: response });
});

router.get('/sobre', async (req, res) => {
    res.render('home/sobre');
});

router.get('/portfolio', async (req, res) => {
    res.render('home/portfolio');
});

module.exports = router;
