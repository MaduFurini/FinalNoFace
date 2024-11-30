const express = require('express');
const router = express.Router();



router.get('/', (req, res) => {
    res.render('home/home');
});

router.get('/shop', (req, res) => {
    res.render('home/shop');
});

module.exports = router;
