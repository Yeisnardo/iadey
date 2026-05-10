// models/aprobacionModel.js
const pool = require('../config/db');

class AprobacionModel {
  // Obtener todas las aprobaciones
  static async getAll() {
    try {
      const result = await pool.query(
        `SELECT 
          a.id_aprobacion,
          a.id_inspeccion,
          a.id_expediente,
          a.verificacion_requisitos,
          a.estatus_aprobacion,
          a.seleccion_manejo,
          a.created_at,
          a.updated_at,
          e.codigo_expediente,
          e.estatus as estatus_expediente,
          p.nombres,
          p.apellidos,
          p.correo as email,
          p.cedula
        FROM aprobacion a
        INNER JOIN expediente e ON a.id_expediente = e.id_expediente
        LEFT JOIN persona p ON CAST(e.id_usuario AS VARCHAR) = p.cedula
        LEFT JOIN solicitud s ON e.id_solicitud = s.id_solicitud
        ORDER BY a.created_at DESC`
      );
      
      // Parsear verificacion_requisitos de JSON string a objeto
      return result.rows.map(row => ({
        ...row,
        verificacion_requisitos: typeof row.verificacion_requisitos === 'string' 
          ? JSON.parse(row.verificacion_requisitos) 
          : row.verificacion_requisitos
      }));
    } catch (error) {
      console.error('Error en getAll aprobaciones:', error);
      throw error;
    }
  }

  // Obtener aprobación por ID
  static async getById(id) {
    try {
      const result = await pool.query(
        `SELECT 
          a.*,
          e.codigo_expediente,
          e.estatus as estatus_expediente,
          e.id_usuario,
          p.nombres,
          p.apellidos,
          p.correo as email,
          p.cedula,
          p.telefono,
          p.direccion
        FROM aprobacion a
        INNER JOIN expediente e ON a.id_expediente = e.id_expediente
        LEFT JOIN persona p ON CAST(e.id_usuario AS VARCHAR) = p.cedula
        LEFT JOIN solicitud s ON e.id_solicitud = s.id_solicitud
        WHERE a.id_aprobacion = $1`,
        [id]
      );
      
      if (!result.rows[0]) return null;
      
      const aprobacion = result.rows[0];
      if (typeof aprobacion.verificacion_requisitos === 'string') {
        aprobacion.verificacion_requisitos = JSON.parse(aprobacion.verificacion_requisitos);
      }
      
      return aprobacion;
    } catch (error) {
      console.error('Error en getById aprobacion:', error);
      throw error;
    }
  }

  // Obtener aprobación por ID de expediente
  static async getByExpediente(idExpediente) {
    try {
      const result = await pool.query(
        `SELECT * FROM aprobacion 
        WHERE id_expediente = $1 
        ORDER BY created_at DESC 
        LIMIT 1`,
        [idExpediente]
      );
      
      if (!result.rows[0]) return null;
      
      const aprobacion = result.rows[0];
      if (typeof aprobacion.verificacion_requisitos === 'string') {
        aprobacion.verificacion_requisitos = JSON.parse(aprobacion.verificacion_requisitos);
      }
      
      return aprobacion;
    } catch (error) {
      console.error('Error en getByExpediente:', error);
      throw error;
    }
  }

  // Crear o actualizar aprobación (UPSERT)
  static async upsert(data) {
    const { 
      id_expediente, 
      verificacion_requisitos, 
      estatus_aprobacion, 
      id_inspeccion,
      seleccion_manejo 
    } = data;
    
    try {
      // Verificar si ya existe una aprobación para este expediente
      const existing = await this.getByExpediente(id_expediente);
      
      let result;
      if (existing) {
        // Actualizar aprobación existente
        result = await pool.query(
          `UPDATE aprobacion 
          SET 
            verificacion_requisitos = $1,
            estatus_aprobacion = $2,
            seleccion_manejo = $3,
            id_inspeccion = COALESCE($4, id_inspeccion),
            updated_at = CURRENT_TIMESTAMP
          WHERE id_expediente = $5
          RETURNING *`,
          [
            JSON.stringify(verificacion_requisitos),
            estatus_aprobacion,
            seleccion_manejo || existing.seleccion_manejo,
            id_inspeccion || existing.id_inspeccion,
            id_expediente
          ]
        );
      } else {
        // Crear nueva aprobación
        result = await pool.query(
          `INSERT INTO aprobacion (
            id_inspeccion,
            id_expediente,
            verificacion_requisitos,
            estatus_aprobacion,
            seleccion_manejo
          ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [
            id_inspeccion || 1,
            id_expediente,
            JSON.stringify(verificacion_requisitos),
            estatus_aprobacion,
            seleccion_manejo || null
          ]
        );
      }
      
      const aprobacion = result.rows[0];
      if (typeof aprobacion.verificacion_requisitos === 'string') {
        aprobacion.verificacion_requisitos = JSON.parse(aprobacion.verificacion_requisitos);
      }
      
      return aprobacion;
    } catch (error) {
      console.error('Error en upsert aprobacion:', error);
      throw error;
    }
  }

  // Actualizar estatus del expediente relacionado
  static async updateExpedienteEstatus(idExpediente, estatus, observaciones) {
    try {
      const result = await pool.query(
        `UPDATE expediente 
        SET estatus = $1, observaciones = $2, updated_at = CURRENT_TIMESTAMP 
        WHERE id_expediente = $3
        RETURNING *`,
        [estatus, observaciones || '', idExpediente]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error en updateExpedienteEstatus:', error);
      throw error;
    }
  }

  // Obtener estadísticas de aprobaciones
  static async getStats() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*)::integer as total,
          COUNT(CASE WHEN estatus_aprobacion = 'Pendiente' THEN 1 END)::integer as pendientes,
          COUNT(CASE WHEN estatus_aprobacion = 'Aprobado' THEN 1 END)::integer as aprobados,
          COUNT(CASE WHEN estatus_aprobacion = 'Rechazado' THEN 1 END)::integer as rechazados,
          COUNT(CASE WHEN estatus_aprobacion = 'En Proceso' THEN 1 END)::integer as en_proceso
        FROM aprobacion
      `);
      return result.rows[0];
    } catch (error) {
      console.error('Error en getStats aprobaciones:', error);
      throw error;
    }
  }
}

module.exports = AprobacionModel;