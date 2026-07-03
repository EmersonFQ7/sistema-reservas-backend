// backend/src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

// Verifica si el usuario envió un Token válido en las cabeceras
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token de autenticación.' });
  }

  try {
    const verificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = verificado; // Guarda los datos decodificados (id, email, rol) en el objeto req
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};

// Limita el acceso únicamente a ciertos roles específicos
const permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes los permisos necesarios para realizar esta acción.' });
    }
    next();
  };
};

module.exports = { verificarToken, permitirRoles };