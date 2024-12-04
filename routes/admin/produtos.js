const express = require('express');
const router = express.Router();
const multer = require('multer');

const {
    upload,
    index,
    indexVariacoes,
    store,
    update,
    destroy,
    show
} = require('../../controllers/produtoController')

const {
    blockDirectAccess
} = require('../../middlewares/blockAcess')

router.get('/', async (req, res) => {
    const response = await index(req);

    if (response.error) {
        return res.status(500).json({ message: response.error });
    }

    if (req.query.nome) {
        return res.json({
            itens: response.itens,
            currentPage: response.currentPage,
            totalPages: response.totalPages
        });
    } else {
        res.render('admin/produtos', {
            itens: response.itens,
            currentPage: response.currentPage,
            totalPages: response.totalPages
        });
    }
});

router.get('/variacoes/:id', blockDirectAccess, async (req, res) => {
    const response = await indexVariacoes(req);

    if (response.error) {
        return res.status(500).json({ message: response.error });
    }

    return res.json({
        itens: response.variacoesMap
    });
});

router.post('/',  upload.single('imagem'), blockDirectAccess, async (req, res) => {
    const response = await store(req);

    if (response) {
        res.status(200).json({ message: 'Produto criado com sucesso.' });
    } else {
        res.status(500).json({ message: response });
    }
});

router.put('/:id', upload.single('imagem'), blockDirectAccess, async (req, res) => {
    const response = await update(req);

    if (response) {
        res.status(200).json({ message: 'Produto atualizado com sucesso.' });
    } else {
        res.status(500).json({ message: response });
    }
});

router.get('/:id', async (req, res) => {
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
