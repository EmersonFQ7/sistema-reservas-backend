// backend/src/routes/servicios.routes.js
const express = require('express');
const router = express.Router();
const { obtenerTodos, obtenerPorId, crear } = require('../controllers/servicios.controller');
const { verificarToken, permitirRoles } = require('../middlewares/auth.middleware');

// Rutas públicas
router.get('/', obtenerTodos);
router.get('/:id', obtenerPorId);

// Ruta protegida (Solo administradores pueden crear nuevos servicios)
router.post('/', verificarToken, permitirRoles('ADMIN'), crear);

module.exports = router;