const express = require('express');
const router = express.Router();

const {
    index,
    store,
    update,
    destroy,
    show,
    indexProdutos
} = require('../../controllers/pedidoController')

const {
    blockDirectAccess
} = require('../../middlewares/blockAcess')
const {
    authMiddleware,
    verifyUserAbility
} = require("../../middlewares/auth");

router.get('/', authMiddleware, verifyUserAbility,async (req, res) => {
    const response = await index(req);

    if (response.error) {
        return res.status(500).json({ message: response.error });
    }

    if (req.query.codigo) {
        return res.json({
            itens: response.itens,
            currentPage: response.currentPage,
            totalPages: response.totalPages
        });
    } else {
        res.render('admin/pedidos', {
            itens: response.itens,
            currentPage: response.currentPage,
            totalPages: response.totalPages
        });
    }
});

router.post('/', blockDirectAccess, async (req, res) => {
    const response = await store(req);

    if (!response.error) {
        res.status(200).json(response);
    } else {
        res.status(500).json({ message: response.error });
    }
});

router.put('/:id', blockDirectAccess, async (req, res) => {
    const response = await update(req);

    if (response) {
        res.status(200).json({ message: 'Pedido atualizado com sucesso.' });
    } else {
        res.status(500).json({ message: response });
    }
});

router.get('/:id', blockDirectAccess, async (req, res) => {
    const response = await show(req);

    if (response) {
        return res.json(response);
    } else {
        res.status(500).json({ message: response });
    }
});

router.delete('/:id', blockDirectAccess, async (req, res) => {
    const response = await destroy(req);

    if (response.message) {
        res.status(200).json({ message: response.message })
    } else {
        res.status(500).json({ message: response });
    }
});

router.get('/produtos/:id', blockDirectAccess, async (req, res) => {
    const response = await indexProdutos(req);

    if (response) {
        return res.json(response);
    } else {
        res.status(500).json({ message: response });
    }
});

module.exports = router;
