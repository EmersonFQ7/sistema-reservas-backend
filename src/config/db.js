// backend/src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

// Creamos un grupo de conexiones (Pool) usando la URL de Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Requerido por Render para conexiones seguras SSL externos
  }
});

// Probar la conexión al iniciar el servidor
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error al conectar a PostgreSQL en Render:', err.stack);
  } else {
    console.log('✅ Conexión exitosa a PostgreSQL en Render. Hora del servidor:', res.rows[0].now);
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool // Lo exportamos por si necesitamos transacciones avanzadas luego
};