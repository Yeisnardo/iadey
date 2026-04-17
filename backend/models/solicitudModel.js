const pool = require('../config/db');

class SolicitudModel {
  // Obtener todas las solicitudes
  static async getAll() {
    const result = await pool.query(`
      SELECT s.*, 
             p.nombre as nombre_persona,
             p.apellido as apellido_persona
      FROM solicitud s
      LEFT JOIN persona p ON s.cedula_persona = p.cedula
      ORDER BY s.id_solicitud DESC
    `);
    return result.rows;
  }

  // Obtener solicitud por ID
  static async getById(id_solicitud) {
    const result = await pool.query(`
      SELECT s.*, 
             p.nombre as nombre_persona,
             p.apellido as apellido_persona,
             e.id_emprendimiento,
             e.nombre_emprendimiento
      FROM solicitud s
      LEFT JOIN persona p ON s.cedula_persona = p.cedula
      LEFT JOIN emprendimiento e ON s.id_solicitud = e.id_solicitud
      WHERE s.id_solicitud = $1
    `, [id_solicitud]);
    return result.rows[0];
  }

  // Obtener solicitudes por cédula de persona
  static async getByCedulaPersona(cedula_persona) {
    const result = await pool.query(`
      SELECT s.*, 
             p.nombre as nombre_persona,
             p.apellido as apellido_persona
      FROM solicitud s
      LEFT JOIN persona p ON s.cedula_persona = p.cedula
      WHERE s.cedula_persona = $1
      ORDER BY s.id_solicitud DESC
    `, [cedula_persona]);
    return result.rows;
  }

  // Crear nueva solicitud
  static async create(data) {
    const { cedula_persona, solicitud, fecha_solicitud, monto_solicitado, estatus } = data;
    
    const result = await pool.query(
      `INSERT INTO solicitud (cedula_persona, solicitud, fecha_solicitud, monto_solicitado, estatus)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [cedula_persona, solicitud, fecha_solicitud, monto_solicitado, estatus || 'pendiente']
    );
    return result.rows[0];
  }

  // Actualizar solicitud
  static async update(id_solicitud, data) {
    const { solicitud, fecha_solicitud, monto_solicitado } = data;
    
    const result = await pool.query(
      `UPDATE solicitud SET
        solicitud = COALESCE($1, solicitud),
        fecha_solicitud = COALESCE($2, fecha_solicitud),
        monto_solicitado = COALESCE($3, monto_solicitado),
        updated_at = CURRENT_TIMESTAMP
      WHERE id_solicitud = $4
      RETURNING *`,
      [solicitud, fecha_solicitud, monto_solicitado, id_solicitud]
    );
    return result.rows[0];
  }

  // Cambiar estatus de solicitud
  static async cambiarEstatus(id_solicitud, estatus, motivo_rechazo = null) {
    const result = await pool.query(
      `UPDATE solicitud SET
        estatus = $1,
        motivo_rechazo = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id_solicitud = $3
      RETURNING *`,
      [estatus, motivo_rechazo, id_solicitud]
    );
    return result.rows[0];
  }

  // Eliminar solicitud
  static async delete(id_solicitud) {
    const result = await pool.query(
      'DELETE FROM solicitud WHERE id_solicitud = $1 RETURNING *',
      [id_solicitud]
    );
    return result.rows[0];
  }

  // Obtener solicitudes por estatus
  static async getByEstatus(estatus) {
    const result = await pool.query(
      `SELECT s.*, p.nombre, p.apellido 
       FROM solicitud s
       LEFT JOIN persona p ON s.cedula_persona = p.cedula
       WHERE s.estatus = $1
       ORDER BY s.id_solicitud DESC`,
      [estatus]
    );
    return result.rows;
  }
}

module.exports = SolicitudModel;