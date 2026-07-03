// backend/src/config/setupDb.js
const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

const runSetup = async () => {
  try {
    console.log('⏳ Iniciando la creación de tablas en Render...');
    
    // Leer el archivo init.sql
    const sqlPath = path.join(__dirname, '../../init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Ejecutar las consultas en la base de datos
    await pool.query(sql);
    
    console.log('✅ ¡Tablas creadas y datos semilla insertados con éxito en Render!');
  } catch (error) {
    console.error('❌ Error al ejecutar el script de base de datos:', error);
  } finally {
    // Cerrar el pool de conexiones al terminar el script
    await pool.end();
  }
};

runSetup();