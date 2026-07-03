// backend/src/controllers/reservas.controller.js
const db = require('../config/db');

// 1. CREAR UNA RESERVA (Cualquier usuario autenticado)
const crearReserva = async (req, res) => {
  const { servicio_id, fecha_hora } = req.body;
  const usuario_id = req.usuario.id; // Obtenido del JWT por el middleware

  if (!servicio_id || !fecha_hora) {
    return res.status(400).json({ error: 'Servicio y fecha/hora son obligatorios.' });
  }

  try {
    // Validación de Cruce de Horarios: Verificar si ya existe una reserva CONFIRMADA en esa misma hora exacta
    const cruce = await db.query(
      "SELECT * FROM reservas WHERE servicio_id = $1 AND fecha_hora = $2 AND estado != 'CANCELADA'",
      [servicio_id, fecha_hora]
    );

    if (cruce.rows.length > 0) {
      return res.status(400).json({ error: 'Lo sentimos, este horario ya se encuentra reservado para este servicio.' });
    }

    // Insertar la reserva (Por defecto quedará PENDIENTE)
    const nuevaReserva = await db.query(
      'INSERT INTO reservas (usuario_id, servicio_id, fecha_hora) VALUES ($1, $2, $3) RETURNING *',
      [usuario_id, servicio_id, fecha_hora]
    );

    return res.status(201).json({
      message: 'Reserva registrada de manera exitosa.',
      reserva: nuevaReserva.rows[0]
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno del servidor al procesar la reserva.' });
  }
};

// 2. OBTENER HISTORIAL / LISTADO (Filtrado según el Rol del Token)
const obtenerReservas = async (req, res) => {
  const { id, rol } = req.usuario;

  try {
    let consulta = `
      SELECT r.id, r.fecha_hora, r.estado, r.created_at,
             s.titulo AS servicio_titulo, s.precio AS servicio_precio, s.imagen_url,
             u.nombre AS cliente_nombre, u.email AS cliente_email
      FROM reservas r
      JOIN servicios s ON r.servicio_id = s.id
      JOIN usuarios u ON r.usuario_id = u.id
    `;
    let parametros = [];

    // Lógica de visualización por roles
    if (rol === 'CLIENTE') {
      consulta += ' WHERE r.usuario_id = $1';
      parametros.push(id);
    } else if (rol === 'OPERADOR') {
      // El operador ve las reservas confirmadas para trabajar en ellas
      consulta += " WHERE r.estado = 'CONFIRMADA'";
    } // Si es ADMIN, no entra a ningún IF y se trae absolutamente todo

    consulta += ' ORDER BY r.fecha_hora ASC';

    const resultado = await db.query(consulta, parametros);
    return res.json(resultado.rows);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al obtener el historial de reservas.' });
  }
};

// 3. ACTUALIZAR ESTADO DE LA RESERVA (ADMIN y OPERADOR cambian estados, CLIENTE solo puede cancelar)
const actualizarEstado = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body; // 'PENDIENTE', 'CONFIRMADA', 'CANCELADA'
  const { rol, id: usuarioId } = req.usuario;

  if (!['PENDIENTE', 'CONFIRMADA', 'CANCELADA'].includes(estado.toUpperCase())) {
    return res.status(400).json({ error: 'Estado enviado no válido.' });
  }

  try {
    // Buscar la reserva actual
    const reservaCheck = await db.query('SELECT * FROM reservas WHERE id = $1', [id]);
    if (reservaCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada.' });
    }

    const reserva = reservaCheck.rows[0];

    // Seguridad: Si es CLIENTE, solo puede cambiar su propia reserva a CANCELADA
    if (rol === 'CLIENTE') {
      if (reserva.usuario_id !== usuarioId) {
        return res.status(403).json({ error: 'No tienes autorización para modificar esta reserva.' });
      }
      if (estado.toUpperCase() !== 'CANCELADA') {
        return res.status(403).json({ error: 'Como cliente, únicamente estás autorizado a cancelar tus reservas.' });
      }
    }

    // Ejecutar la actualización en Render
    const actualizado = await db.query(
      'UPDATE reservas SET estado = $1 WHERE id = $2 RETURNING *',
      [estado.toUpperCase(), id]
    );

    return res.json({ message: 'Estado actualizado correctamente', reserva: actualizado.rows[0] });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al cambiar el estado de la reserva.' });
  }
};

module.exports = { crearReserva, obtenerReservas, actualizarEstado };