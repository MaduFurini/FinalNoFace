const express = require('express');
const router = express.Router();

const {
    index,
    store,
    update,
    destroy,
    show
} = require('../../controllers/categoriaController')

const {
    blockDirectAccess
} = require('../../middlewares/blockAcess')
const {
    authMiddleware,
    verifyUserAbility
} = require('../../middlewares/auth')


router.get('/', authMiddleware, verifyUserAbility, async (req, res) => {
    const response = await index(req);

    if (response.error) {
        return res.status(500).json({ message: response.error });
    }

    if (req.query.nome || req.query.status) {
        return res.json({
            itens: response.itens,
            currentPage: response.currentPage,
            totalPages: response.totalPages
        });
    } else {
        res.render('admin/categorias', {
            itens: response.itens,
            currentPage: response.currentPage,
            totalPages: response.totalPages
        });
    }
});

router.post('/', blockDirectAccess, async (req, res) => {
    const response = await store(req);

    if (response) {
        res.status(200).json({ message: 'Categoria criada com sucesso.' });
    } else {
        res.status(500).json({ message: response });
    }
});

router.put('/:id', blockDirectAccess, async (req, res) => {
    const response = await update(req);

    if (response) {
        res.status(200).json({ message: 'Categoria atualizada com sucesso.' });
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

module.exports = router;
