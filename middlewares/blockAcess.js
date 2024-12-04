const express = require('express');
const router = express.Router();

const blockDirectAccess = (req, res, next) => {
    if (req.headers['x-internal-request'] === 'true') {
        next();
    } else {
        res.status(404).render('error/pageNotFound', { url: req.originalUrl });
    }
};

module.exports = { blockDirectAccess }