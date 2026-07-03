// backend/src/app.js
const express = require('express');
const cors = require('cors'); // o usar el paquete 'cors' estándar
require('dotenv').config();

// Importar la base de datos para asegurar conexión inicial
require('./config/db');

const app = express();

// Middlewares Globales
app.use(express.json()); // Permite leer req.body en formato JSON

// Configurar CORS básico para permitir que Next.js (Vercel) se conecte sin problemas
const corsOptions = {
  origin: '*', // En producción cambiaremos esto por la URL de Vercel
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Ruta de prueba inicial
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor del Sistema de Reservas corriendo perfectamente' });
});

// --- AQUÍ CONECTAREMOS LAS RUTAS MÁS ADELANTE ---
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/servicios', require('./routes/servicios.routes'));
app.use('/api/reservas', require('./routes/reservas.routes'));

// Escuchar puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor HTTP corriendo en el puerto ${PORT}`);
});