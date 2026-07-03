// backend/src/controllers/servicios.controller.js
const db = require('../config/db');

// Obtener todos los servicios (Para el feed de Pinterest)
const obtenerTodos = async (req, res) => {
  try {
    const resultado = await db.query('SELECT * FROM servicios ORDER BY id DESC');
    return res.json(resultado.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener los servicios.' });
  }
};

// Obtener un servicio por ID (Para la página dinámica de Next.js)
const obtenerPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await db.query('SELECT * FROM servicios WHERE id = $1', [id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado.' });
    }
    return res.json(resultado.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener el servicio.' });
  }
};

// Crear un nuevo servicio (Solo ADMIN)
const crear = async (req, res) => {
  const { titulo, descripcion, precio, duracion, imagen_url } = req.body;

  if (!titulo || !descripcion || !precio || !duracion || !imagen_url) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const nuevo = await db.query(
      'INSERT INTO servicios (titulo, descripcion, precio, duracion, imagen_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [titulo, descripcion, precio, duracion, imagen_url]
    );
    return res.status(201).json(nuevo.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al crear el servicio.' });
  }
};

module.exports = { obtenerTodos, obtenerPorId, crear };