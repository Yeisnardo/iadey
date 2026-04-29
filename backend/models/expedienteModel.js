const pool = require('../config/db');

class ExpedienteModel {

  // Obtener solo solicitudes aprobadas con sus datos Y expediente si existe
  static async getSolAprobadasExp() {
    const query = `
      SELECT 
        s.id_solicitud,
        s.cedula_persona,
        s.solicitud as motivo_solicitud,
        s.monto_solicitado,
        s.fecha_solicitud,
        s.estatus,
        s.motivo_rechazo,
        s.created_at as solicitud_creada,
        p.cedula as cedula_persona_numero,
        p.nombres,
        p.apellidos,
        p.telefono,
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
        e.cedula_emprendimiento,
        e.id_clasificacion,
        c.sector,
        c.actividad,
        -- Datos del expediente si existe
        exp.id_expediente,
        exp.codigo_expediente,
        exp.estatus as estatus_expediente,
        exp.created_at as expediente_creado,
        exp.id_usuario,
        exp.observaciones,
        exp.id_requisitos,
        u.cedula_usuario as inspector_cedula,
        u.rol as inspector_rol,
        CONCAT(pi.nombres, ' ', pi.apellidos) as inspector_nombre
      FROM solicitud s
      INNER JOIN persona p ON s.cedula_persona = p.cedula
      LEFT JOIN emprendimiento e ON s.id_solicitud = e.id_solicitud
      LEFT JOIN clasificacion_emprendimiento c ON e.id_clasificacion = c.id_clasificacion
      -- LEFT JOIN con expediente para obtener datos si existe
      LEFT JOIN expediente exp ON s.id_solicitud = exp.id_solicitud
      LEFT JOIN usuario u ON exp.id_usuario = u.id
      LEFT JOIN persona pi ON u.cedula_usuario = pi.cedula
      WHERE s.estatus = 'Aprobado'
      ORDER BY s.id_solicitud DESC
    `;
    
    try {
      const result = await pool.query(query);
      console.log(`✅ ${result.rows.length} solicitudes aprobadas encontradas`);
      console.log(`📊 Solicitudes con expediente: ${result.rows.filter(r => r.id_expediente).length}`);
      return result.rows;
    } catch (error) {
      console.error('❌ Error en getSolAprobadasExp:', error);
      throw error;
    }
  }

  // Verificar si ya existe un expediente para una solicitud
  static async existsBySolicitud(id_solicitud) {
    const query = 'SELECT id_expediente FROM expediente WHERE id_solicitud = $1 LIMIT 1';
    try {
      const result = await pool.query(query, [id_solicitud]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('❌ Error en existsBySolicitud:', error);
      throw error;
    }
  }

  // Crear expediente
  static async create(data) {
    const {
      id_solicitud,
      id_usuario,
      ids_requisitos,
      observaciones,
      codigo_expediente,
      estatus
    } = data;

    // Validaciones detalladas
    if (!id_solicitud) throw new Error('id_solicitud es requerido');
    if (!id_usuario) throw new Error('id_usuario (inspector) es requerido');
    if (!codigo_expediente) throw new Error('codigo_expediente es requerido');
    if (!estatus) throw new Error('estatus es requerido');

    // Convertir array de requisitos a string separado por comas
    let requisitosString = '';
    if (Array.isArray(ids_requisitos) && ids_requisitos.length > 0) {
      requisitosString = ids_requisitos.join(',');
    } else if (ids_requisitos) {
      requisitosString = String(ids_requisitos);
    }

    console.log("📝 Guardando requisitos como string:", requisitosString);

    const query = `
      INSERT INTO expediente (
        id_solicitud,
        id_usuario,
        id_requisitos,
        observaciones,
        codigo_expediente,
        estatus,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const values = [
      id_solicitud,
      id_usuario,
      requisitosString,
      observaciones || 'Pendiente de verificación',
      codigo_expediente,
      estatus
    ];

    try {
      console.log("📤 Ejecutando INSERT con valores:", values);
      const result = await pool.query(query, values);
      console.log("✅ Expediente creado con ID:", result.rows[0].id_expediente);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error en create expediente:', error);
      throw new Error(`Error al crear expediente: ${error.message}`);
    }
  }

  // Obtener expediente por ID
  static async getById(id_expediente) {
    const query = `
      SELECT e.*, 
             s.solicitud as motivo_solicitud,
             s.monto_solicitado,
             u.cedula_usuario,
             u.rol as inspector_rol
      FROM expediente e
      LEFT JOIN solicitud s ON e.id_solicitud = s.id_solicitud
      LEFT JOIN usuario u ON e.id_usuario = u.id
      WHERE e.id_expediente = $1
    `;
    try {
      const result = await pool.query(query, [id_expediente]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error en getById:', error);
      throw error;
    }
  }

  // Obtener expediente por código
  static async getByCodigo(codigo_expediente) {
    const query = `
      SELECT e.*, 
             s.solicitud as motivo_solicitud,
             s.monto_solicitado,
             u.cedula_usuario,
             u.rol as inspector_rol
      FROM expediente e
      LEFT JOIN solicitud s ON e.id_solicitud = s.id_solicitud
      LEFT JOIN usuario u ON e.id_usuario = u.id
      WHERE e.codigo_expediente = $1
    `;
    try {
      const result = await pool.query(query, [codigo_expediente]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error en getByCodigo:', error);
      throw error;
    }
  }

  // Actualizar expediente
  static async update(id_expediente, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.estatus) {
      fields.push(`estatus = $${paramCount}`);
      values.push(data.estatus);
      paramCount++;
    }
    
    if (data.observaciones) {
      fields.push(`observaciones = $${paramCount}`);
      values.push(data.observaciones);
      paramCount++;
    }

    if (fields.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    values.push(id_expediente);
    
    const query = `
      UPDATE expediente 
      SET ${fields.join(', ')}
      WHERE id_expediente = $${paramCount}
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error en update:', error);
      throw error;
    }
  }
}

module.exports = ExpedienteModel;