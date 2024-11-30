const express = require('express');
const router = express.Router();
router.use('/assets', express.static('assets'));

// ROTAS
const pedidosRoutes = require('./admin/pedidos');
const variacoesRoutes = require('./admin/variacoes');
const categoriasRoutes = require('./admin/categorias');
const funcionariosRoutes = require('./admin/funcionarios');
const produtosRoutes = require('./admin/produtos');
const homeRoutes = require('./home/home');
const shopRoutes = require('./users/shop');

router.use('/admin/pedidos', pedidosRoutes);
router.use('/admin/variacoes', variacoesRoutes);
router.use('/admin/categorias', categoriasRoutes);
router.use('/admin/funcionarios', funcionariosRoutes);
router.use('/admin/produtos', produtosRoutes);

router.use('/', homeRoutes);

router.use('/shop', shopRoutes);

module.exports = router;
