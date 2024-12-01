const express = require('express');
const router = express.Router();

const {
    indexHome,
    indexShop
} = require('../../controllers/produtoController')


router.get('/', async (req, res) => {
    const response = await indexHome(req);

    if (response.error) {
        return res.status(500).json({ message: response.error });
    }

    res.render('home/home', {
        itens: response.itens
    });
});


router.get('/shop', async (req, res) => {
    const { categorias, produtosPorCategoria } = await indexShop(req, res);

    console.log(categorias)
    res.render('home/shop', { categorias, produtosPorCategoria });
});

module.exports = router;
