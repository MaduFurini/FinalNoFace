const express = require('express');
const router = express.Router();
const { Produto } = require('../models');

router.get('/', (req, res) => {
    res.render('users/shop', { products: Produto.findAll() });
});


module.exports = router;
