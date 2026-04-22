const pool = require('../config/db');

class ExpedienteModel {
  // Obtener todos los expedientes
  static async getAll() {
    const result = await pool.query(`
      SELECT e.*, 
             p.nombres, p.apellidos, p.cedula, p.telefono, p.correo,
             s.solicitud, s.monto_solicitado, s.estatus as solicitud_estatus,
             u.nombre as usuario_nombre
      FROM expediente e
      LEFT JOIN solicitud s ON e.id_solicitud = s.id_solicitud
      LEFT JOIN persona p ON s.cedula_persona = p.cedula
      LEFT JOIN usuario u ON e.id_usuario = u.id
      ORDER BY e.created_at DESC
    `);
    return result.rows;
  }

  // Obtener expediente por ID
  static async getById(id) {
    const result = await pool.query(`
      SELECT e.*, 
             p.nombres, p.apellidos, p.cedula, p.telefono, p.correo, p.direccion,
             s.solicitud, s.monto_solicitado, s.estatus as solicitud_estatus,
             u.nombre as usuario_nombre, u.email as usuario_email
      FROM expediente e
      LEFT JOIN solicitud s ON e.id_solicitud = s.id_solicitud
      LEFT JOIN persona p ON s.cedula_persona = p.cedula
      LEFT JOIN usuario u ON e.id_usuario = u.id
      WHERE e.id_expediente = $1
    `, [id]);
    return result.rows[0];
  }

  // Obtener expediente por código
  static async getByCodigo(codigo) {
    const result = await pool.query(`
      SELECT e.*, 
             p.nombres, p.apellidos, p.cedula, p.telefono, p.correo,
             s.solicitud, s.monto_solicitado
      FROM expediente e
      LEFT JOIN solicitud s ON e.id_solicitud = s.id_solicitud
      LEFT JOIN persona p ON s.cedula_persona = p.cedula
      WHERE e.codigo_expediente = $1
    `, [codigo]);
    return result.rows[0];
  }

  // Obtener expedientes por usuario (inspector)
  static async getByUsuario(id_usuario) {
    const result = await pool.query(`
      SELECT e.*, 
             p.nombres, p.apellidos, p.cedula,
             s.solicitud, s.monto_solicitado
      FROM expediente e
      LEFT JOIN solicitud s ON e.id_solicitud = s.id_solicitud
      LEFT JOIN persona p ON s.cedula_persona = p.cedula
      WHERE e.id_usuario = $1
      ORDER BY e.created_at DESC
    `, [id_usuario]);
    return result.rows;
  }

  // Obtener expedientes por estatus
  static async getByEstatus(estatus) {
    const result = await pool.query(`
      SELECT e.*, 
             p.nombres, p.apellidos, p.cedula,
             s.solicitud, s.monto_solicitado
      FROM expediente e
      LEFT JOIN solicitud s ON e.id_solicitud = s.id_solicitud
      LEFT JOIN persona p ON s.cedula_persona = p.cedula
      WHERE e.estatus = $1
      ORDER BY e.created_at DESC
    `, [estatus]);
    return result.rows;
  }

  // Crear expediente
  static async create(data) {
    const {
      id_solicitud,
      id_usuario,
      id_requisitos,
      verificacion_requisitos,
      codigo_expediente,
      estatus
    } = data;

    const result = await pool.query(
      `INSERT INTO expediente (
        id_solicitud, id_usuario, id_requisitos, verificacion_requisitos,
        codigo_expediente, estatus
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [id_solicitud, id_usuario, id_requisitos, verificacion_requisitos,
       codigo_expediente, estatus || 'Activo']
    );
    return result.rows[0];
  }

  // Actualizar expediente
  static async update(id, data) {
    const {
      id_solicitud,
      id_requisitos,
      verificacion_requisitos,
      estatus
    } = data;

    const result = await pool.query(
      `UPDATE expediente SET
        id_solicitud = COALESCE($1, id_solicitud),
        id_requisitos = COALESCE($2, id_requisitos),
        verificacion_requisitos = COALESCE($3, verificacion_requisitos),
        estatus = COALESCE($4, estatus),
        updated_at = CURRENT_TIMESTAMP
      WHERE id_expediente = $5 
      RETURNING *`,
      [id_solicitud, id_requisitos, verificacion_requisitos, estatus, id]
    );
    return result.rows[0];
  }

  // Actualizar estatus
  static async updateStatus(id, estatus) {
    const result = await pool.query(
      `UPDATE expediente 
       SET estatus = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id_expediente = $2 
       RETURNING *`,
      [estatus, id]
    );
    return result.rows[0];
  }

  // Eliminar expediente
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM expediente WHERE id_expediente = $1 RETURNING *', 
      [id]
    );
    return result.rows[0];
  }

  // Obtener último número de expediente del año
  static async getLastExpedienteNumber(year) {
    const result = await pool.query(
      `SELECT COUNT(*) as count 
       FROM expediente 
       WHERE codigo_expediente LIKE $1`,
      [`EXP-${year}-%`]
    );
    return parseInt(result.rows[0].count) || 0;
  }
}

module.exports = ExpedienteModel;