// backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { registrar, login } = require('../controllers/auth.controller');

// Definición de endpoints REST
router.post('/register', registrar);
router.post('/login', login);

module.exports = router;