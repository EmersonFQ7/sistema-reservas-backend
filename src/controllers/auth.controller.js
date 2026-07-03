// backend/src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// 1. REGISTRO DE USUARIOS
const registrar = async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  // Validaciones básicas de entrada
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados.' });
  }

  try {
    // Verificar si el correo electrónico ya está registrado
    const existeUser = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (existeUser.rows.length > 0) {
      return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado.' });
    }

    // Encriptar la contraseña (Requerimiento 1 obligatorio)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Definir rol por defecto si no viene, validando los permitidos
    const rolUsuario = rol && ['CLIENTE', 'OPERADOR', 'ADMIN'].includes(rol.toUpperCase()) 
      ? rol.toUpperCase() 
      : 'CLIENTE';

    // Insertar en la Base de Datos de Render
    const nuevoUsuario = await db.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol',
      [nombre, email, passwordHash, rolUsuario]
    );

    return res.status(201).json({
      message: 'Usuario registrado con éxito',
      usuario: nuevoUsuario.rows[0]
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor al procesar el registro.' });
  }
};

// 2. INICIO DE SESIÓN (LOGIN)
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Debes rellenar todos los campos.' });
  }

  try {
    // Buscar usuario en la base de datos
    const resultado = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const usuario = resultado.rows[0];

    if (!usuario) {
      return res.status(400).json({ error: 'Credenciales inválidas (Usuario no encontrado).' });
    }

    // Verificar si la contraseña coincide usando bcryptjs
    const passwordCorrecto = await bcrypt.compare(password, usuario.password);
    if (!passwordCorrecto) {
      return res.status(400).json({ error: 'Credenciales inválidas (Contraseña incorrecta).' });
    }

    // Generar Token JWT firmado con duración de 24 horas
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Retornar datos de éxito y token al frontend
    return res.json({
      message: 'Autenticación exitosa',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor al procesar el inicio de sesión.' });
  }
};

module.exports = { registrar, login };