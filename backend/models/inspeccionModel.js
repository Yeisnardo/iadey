// backend/models/inspeccionModel.js
const pool = require('../config/db');

class InspeccionModel {
  // Obtener todas las inspecciones con datos relacionados del expediente
  static async getAll() {
    const query = `
      SELECT 
        i.id_inspeccion,
        i.id_codigo_exp,
        i.id_tipo_insp_clas,
        i.estatus_inspeccion,
        i.created_at,
        i.updated_at,
        e.codigo_expediente,
        e.id_solicitud,
        s.cedula_persona,
        em.id_emprendimiento,
        em.nombre_emprendimiento,
        em.direccion_empredimiento,
        em.anos_experiencia,
        c.sector,
        c.actividad,
        c.n_ins_asig
      FROM inspeccion i
      JOIN expediente e ON i.id_codigo_exp = e.id_expediente
      JOIN solicitud s ON e.id_solicitud = s.id_solicitud
      JOIN emprendimiento em ON s.id_solicitud = em.id_solicitud
      JOIN clasificacion_emprendimiento c ON em.id_clasificacion = c.id_clasificacion
      ORDER BY i.id_inspeccion DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Obtener una inspección por ID con datos completos
  static async getById(id) {
    const query = `
      SELECT 
        i.*,
        e.codigo_expediente,
        e.id_solicitud,
        em.id_emprendimiento,
        em.nombre_emprendimiento,
        em.direccion_empredimiento,
        em.anos_experiencia,
        em.cedula_emprendimiento,
        c.id_clasificacion,
        c.sector,
        c.actividad,
        c.n_ins_asig,
        s.solicitud,
        s.monto_solicitado,
        p.nombres as nombre_emprendedor,
        p.cedula as cedula_emprendedor,
        p.telefono,
        p.correo
      FROM inspeccion i
      JOIN expediente e ON i.id_codigo_exp = e.id_expediente
      JOIN solicitud s ON e.id_solicitud = s.id_solicitud
      JOIN emprendimiento em ON s.id_solicitud = em.id_solicitud
      JOIN clasificacion_emprendimiento c ON em.id_clasificacion = c.id_clasificacion
      JOIN persona p ON s.cedula_persona = p.cedula
      WHERE i.id_inspeccion = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Obtener inspecciones por expediente
  static async getByExpediente(id_codigo_exp) {
    const query = `
      SELECT 
        i.*,
        e.codigo_expediente,
        e.id_solicitud,
        em.nombre_emprendimiento,
        c.sector,
        c.actividad,
        c.n_ins_asig
      FROM inspeccion i
      JOIN expediente e ON i.id_codigo_exp = e.id_expediente
      JOIN solicitud s ON e.id_solicitud = s.id_solicitud
      JOIN emprendimiento em ON s.id_solicitud = em.id_solicitud
      JOIN clasificacion_emprendimiento c ON em.id_clasificacion = c.id_clasificacion
      WHERE i.id_codigo_exp = $1
      ORDER BY i.created_at DESC
    `;
    const result = await pool.query(query, [id_codigo_exp]);
    return result.rows;
  }

  // Obtener datos del emprendimiento para nueva inspección
  static async getEmprendimientoData(id_expediente) {
    const query = `
      SELECT 
        e.id_expediente,
        e.codigo_expediente,
        e.id_solicitud,
        em.id_emprendimiento,
        em.nombre_emprendimiento,
        em.direccion_empredimiento,
        em.anos_experiencia,
        em.cedula_emprendimiento,
        c.id_clasificacion,
        c.sector,
        c.actividad,
        c.n_ins_asig,
        s.id_solicitud,
        s.solicitud,
        s.monto_solicitado,
        p.nombres as nombre_emprendedor,
        p.cedula as cedula_emprendedor,
        p.telefono,
        p.correo
      FROM expediente e
      JOIN solicitud s ON e.id_solicitud = s.id_solicitud
      JOIN emprendimiento em ON s.id_solicitud = em.id_solicitud
      JOIN clasificacion_emprendimiento c ON em.id_clasificacion = c.id_clasificacion
      JOIN persona p ON s.cedula_persona = p.cedula
      WHERE e.id_expediente = $1
    `;
    const result = await pool.query(query, [id_expediente]);
    return result.rows[0];
  }

  // Crear nueva inspección
  static async create(inspeccionData) {
    const { id_codigo_exp, id_tipo_insp_clas, estatus_inspeccion } = inspeccionData;
    const query = `
      INSERT INTO inspeccion (id_codigo_exp, id_tipo_insp_clas, estatus_inspeccion, created_at, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    const result = await pool.query(query, [id_codigo_exp, id_tipo_insp_clas, estatus_inspeccion]);
    return result.rows[0];
  }

  // Actualizar inspección existente
  static async update(id, inspeccionData) {
    const { id_tipo_insp_clas, estatus_inspeccion, observaciones, calificacion, recomendaciones, duracion, inspector, resultados_completos } = inspeccionData;
    
    // Si hay resultados completos, guardarlos como JSON
    if (resultados_completos) {
      const query = `
        UPDATE inspeccion 
        SET id_tipo_insp_clas = COALESCE($1, id_tipo_insp_clas),
            estatus_inspeccion = COALESCE($2, estatus_inspeccion),
            observaciones = $3,
            calificacion = $4,
            recomendaciones = $5,
            duracion = $6,
            inspector = $7,
            resultados_inspeccion = $8,
            updated_at = CURRENT_TIMESTAMP
        WHERE id_inspeccion = $9
        RETURNING *
      `;
      const result = await pool.query(query, [
        id_tipo_insp_clas, 
        estatus_inspeccion, 
        observaciones, 
        calificacion, 
        recomendaciones, 
        duracion, 
        inspector,
        JSON.stringify(resultados_completos),
        id
      ]);
      return result.rows[0];
    } else {
      const query = `
        UPDATE inspeccion 
        SET id_tipo_insp_clas = COALESCE($1, id_tipo_insp_clas),
            estatus_inspeccion = COALESCE($2, estatus_inspeccion),
            observaciones = COALESCE($3, observaciones),
            calificacion = COALESCE($4, calificacion),
            recomendaciones = COALESCE($5, recomendaciones),
            duracion = COALESCE($6, duracion),
            inspector = COALESCE($7, inspector),
            updated_at = CURRENT_TIMESTAMP
        WHERE id_inspeccion = $8
        RETURNING *
      `;
      const result = await pool.query(query, [
        id_tipo_insp_clas, 
        estatus_inspeccion, 
        observaciones, 
        calificacion, 
        recomendaciones, 
        duracion, 
        inspector, 
        id
      ]);
      return result.rows[0];
    }
  }

  // Guardar resultados de inspección (formulario dinámico)
  static async saveInspectionResults(id_inspeccion, results) {
    const query = `
      UPDATE inspeccion 
      SET resultados_inspeccion = $1,
          estatus_inspeccion = $2,
          calificacion = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id_inspeccion = $4
      RETURNING *
    `;
    const result = await pool.query(query, [
      JSON.stringify(results), 
      results.evaluacionFinal?.estatus || 'Completada',
      results.evaluacionFinal?.calificacion || 0,
      id_inspeccion
    ]);
    return result.rows[0];
  }

  // Obtener estadísticas de inspecciones
  static async getEstadisticas() {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN estatus_inspeccion = 'Aprobado' THEN 1 END) as aprobadas,
        COUNT(CASE WHEN estatus_inspeccion = 'Aprobado con observaciones' THEN 1 END) as aprobadas_obs,
        COUNT(CASE WHEN estatus_inspeccion = 'Rechazado' THEN 1 END) as rechazadas,
        COUNT(CASE WHEN estatus_inspeccion = 'Pendiente' THEN 1 END) as pendientes,
        AVG(calificacion) as promedio_calificacion,
        COUNT(CASE WHEN id_tipo_insp_clas = 1 THEN 1 END) as tipo_inicial,
        COUNT(CASE WHEN id_tipo_insp_clas = 2 THEN 1 END) as tipo_reinspeccion,
        COUNT(CASE WHEN id_tipo_insp_clas = 3 THEN 1 END) as tipo_periodica,
        COUNT(CASE WHEN id_tipo_insp_clas = 4 THEN 1 END) as tipo_seguimiento
      FROM inspeccion
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }
}

module.exports = InspeccionModel;