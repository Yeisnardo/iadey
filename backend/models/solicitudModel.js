// models/SolicitudModel.js
const pool = require('../config/db');

class SolicitudModel {

  // Agregar este método a tu SolicitudModel existente

// Obtener solo solicitudes aprobadas
static async getAprobadas() {
  const result = await pool.query(`
    SELECT 
      s.*, 
      p.nombres,
      p.apellidos,
      CONCAT(p.nombres, ' ', p.apellidos) as nombre_completo,
      p.telefono,
      p.correo,
      p.email,
      p.direccion,
      p.estado as estado_persona,
      p.municipio,
      p.parroquia,
      p.tipo_persona,
      e.id_emprendimiento,
      e.nombre_emprendimiento,
      e.direccion_empredimiento,
      e.anos_experiencia,
      e.id_clasificacion,
      c.sector,
      c.actividad
    FROM solicitud s
    INNER JOIN persona p ON s.cedula_persona = p.cedula
    LEFT JOIN emprendimiento e ON s.id_solicitud = e.id_solicitud
    LEFT JOIN clasificacion_emprendimiento c ON e.id_clasificacion = c.id_clasificacion
    WHERE s.estatus = 'Aprobado'
    ORDER BY s.id_solicitud DESC
  `);
  return result.rows;
}
  
  // Obtener todas las solicitudes con datos completos
  static async getAll() {
    const result = await pool.query(`
      SELECT 
        s.*, 
        p.nombres,
        p.apellidos,
        CONCAT(p.nombres, ' ', p.apellidos) as nombre_completo,
        p.telefono,
        p.correo,
        p.email,
        p.direccion,
        p.estado as estado_persona,
        p.municipio,
        p.parroquia,
        p.tipo_persona,
        e.id_emprendimiento,
        e.nombre_emprendimiento,
        e.direccion_empredimiento,
        e.anos_experiencia,
        e.id_clasificacion,
        c.sector,
        c.actividad
      FROM solicitud s
      INNER JOIN persona p ON s.cedula_persona = p.cedula
      LEFT JOIN emprendimiento e ON s.id_solicitud = e.id_solicitud
      LEFT JOIN clasificacion_emprendimiento c ON e.id_clasificacion = c.id_clasificacion
      ORDER BY s.id_solicitud DESC
    `);
    return result.rows;
  }

  // Obtener emprendedores únicos (personas con solicitudes)
  static async getEmprendedores() {
    const query = `
      WITH emprendedores_cte AS (
        SELECT DISTINCT ON (p.cedula)
          p.cedula,
          p.nombres,
          p.apellidos,
          CONCAT(p.nombres, ' ', p.apellidos) as nombre_completo,
          p.telefono,
          p.correo,
          p.email,
          p.direccion,
          p.estado as estado_persona,
          p.municipio,
          p.parroquia,
          p.tipo_persona,
          COUNT(s.id_solicitud) as total_solicitudes,
          MAX(s.created_at) as ultima_solicitud
        FROM persona p
        LEFT JOIN solicitud s ON p.cedula = s.cedula_persona
        GROUP BY p.cedula, p.nombres, p.apellidos, p.telefono, 
                 p.correo, p.email, p.direccion, p.estado, 
                 p.municipio, p.parroquia, p.tipo_persona
      )
      SELECT 
        e.*,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id_solicitud', s2.id_solicitud,
                'solicitud', s2.solicitud,
                'fecha_solicitud', s2.fecha_solicitud,
                'monto_solicitado', s2.monto_solicitado,
                'estatus', s2.estatus,
                'created_at', s2.created_at
              ) ORDER BY s2.created_at DESC
            )
            FROM solicitud s2 
            WHERE s2.cedula_persona = e.cedula
          ),
          '[]'::json
        ) as solicitudes
      FROM emprendedores_cte e
      ORDER BY e.ultima_solicitud DESC NULLS LAST, e.nombre_completo ASC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  // Obtener solicitud por ID
  static async getById(id_solicitud) {
    const result = await pool.query(`
      SELECT 
        s.*, 
        p.nombres,
        p.apellidos,
        CONCAT(p.nombres, ' ', p.apellidos) as nombre_completo,
        p.cedula,
        p.telefono,
        p.correo,
        p.email,
        p.direccion,
        p.estado as estado_persona,
        p.municipio,
        p.parroquia,
        p.tipo_persona,
        e.id_emprendimiento,
        e.nombre_emprendimiento,
        e.direccion_empredimiento,
        e.anos_experiencia,
        e.id_clasificacion,
        c.sector,
        c.actividad
      FROM solicitud s
      INNER JOIN persona p ON s.cedula_persona = p.cedula
      LEFT JOIN emprendimiento e ON s.id_solicitud = e.id_solicitud
      LEFT JOIN clasificacion_emprendimiento c ON e.id_clasificacion = c.id_clasificacion
      WHERE s.id_solicitud = $1
    `, [id_solicitud]);
    return result.rows[0];
  }

  // Obtener solicitudes por cédula de persona
  static async getByCedulaPersona(cedula_persona) {
    const result = await pool.query(`
      SELECT 
        s.*,
        p.nombres,
        p.apellidos,
        CONCAT(p.nombres, ' ', p.apellidos) as nombre_completo,
        p.telefono,
        p.correo,
        p.email,
        p.direccion,
        e.id_emprendimiento,
        e.nombre_emprendimiento,
        e.direccion_empredimiento,
        e.anos_experiencia,
        e.id_clasificacion,
        c.sector,
        c.actividad
      FROM solicitud s
      INNER JOIN persona p ON s.cedula_persona = p.cedula
      LEFT JOIN emprendimiento e ON s.id_solicitud = e.id_solicitud
      LEFT JOIN clasificacion_emprendimiento c ON e.id_clasificacion = c.id_clasificacion
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
      [cedula_persona, solicitud, fecha_solicitud, monto_solicitado, estatus || 'Pendiente']
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
      `SELECT 
        s.*, 
        p.nombres,
        p.apellidos,
        CONCAT(p.nombres, ' ', p.apellidos) as nombre_completo,
        e.nombre_emprendimiento
      FROM solicitud s
      INNER JOIN persona p ON s.cedula_persona = p.cedula
      LEFT JOIN emprendimiento e ON s.id_solicitud = e.id_solicitud
      WHERE s.estatus = $1
      ORDER BY s.id_solicitud DESC`,
      [estatus]
    );
    return result.rows;
  }
}

module.exports = SolicitudModel;