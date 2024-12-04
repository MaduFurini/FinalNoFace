// IMPORTAÇÃO DE DEPENDÊNCIAS
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require("fs");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const db = require('./db');
const routes = require('./routes');

// CONFIGURAÇÕES DE SERVIDOR
const app = express();
const router = express.Router();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'exerIsTGHyhAPfuWDgjqWw',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 1000,
        httpOnly: true,
    }
}));

app.post('/set', (req, res) => {
    const { parameter } = req.body;

    if (parameter != null) {
        req.session.data = {
            parameter: parameter
        };
    } else {
        req.session.data = null;
    }

    return res.json({ success: true });
});

app.use('/noFace/', routes);

app.use((req, res) => {
    res.status(404).render('error/pageNotFound', { url: req.originalUrl });
});

app.listen('3000', function (e) {
    if (e) {
        console.log(e);
    } else {
        console.log('Servidor iniciado');
    }
});

db.authenticate().then(() => {
    console.log('Conexão com o banco de dados realizada com sucesso.');
}).catch((e) => {
    console.log('Erro ao conectar ao banco de dados: ' + e);
});
