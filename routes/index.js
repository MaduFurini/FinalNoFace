const express = require('express');
const router = express.Router();
router.use('/assets', express.static('assets'));

// ROTAS
const pedidosRoutes = require('./admin/pedidos');
const variacoesRoutes = require('./admin/variacoes');
const categoriasRoutes = require('./admin/categorias');
const funcionariosRoutes = require('./admin/funcionarios');
const produtosRoutes = require('./admin/produtos');
const usuariosRoutes = require('./admin/usuarios');
const homeRoutes = require('./home/home');
const loginRoutes = require('./login/login');

router.use('/admin/pedidos', pedidosRoutes);
router.use('/admin/variacoes', variacoesRoutes);
router.use('/admin/categorias', categoriasRoutes);
router.use('/admin/funcionarios', funcionariosRoutes);
router.use('/admin/produtos', produtosRoutes);
router.use('/admin/usuarios', usuariosRoutes);

router.use('/login', loginRoutes);

router.use('/home', homeRoutes);

module.exports = router;
