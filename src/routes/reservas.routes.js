// backend/src/routes/reservas.routes.js
const express = require('express');
const router = express.Router();
const { crearReserva, obtenerReservas, actualizarEstado } = require('../controllers/reservas.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

// Todas las rutas de reservas requieren estar logueado (verificarToken)
router.post('/', verificarToken, crearReserva);
router.get('/', verificarToken, obtenerReservas);
router.put('/:id', verificarToken, actualizarEstado);

module.exports = router;