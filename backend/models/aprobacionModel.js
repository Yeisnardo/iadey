const pool = require('../config/db');

class AprobacionModel {
  // Obtener todos los expedientes con información relacionada
  static async getAllExpedientes() {
    try {
      const query = `
        SELECT 
          e.id_expediente,
          e.codigo_expediente,
          e.id_solicitud,
          e.id_usuario,
          e.id_requisitos,
          e.estatus,
          e.observaciones,
          e.created_at,
          e.updated_at,
          p.nombres,
          p.apellidos,
          p.correo as email,
          p.cedula,
          p.telefono,
          s.monto_solicitado,
          a.id_aprobacion,
          a.verificacion_requisitos,
          a.estatus_aprobacion,
          a.seleccion_manejo
        FROM expediente e
        LEFT JOIN persona p ON CAST(e.id_usuario AS VARCHAR) = p.cedula
        LEFT JOIN solicitud s ON e.id_solicitud = s.id_solicitud
        LEFT JOIN aprobacion a ON e.id_expediente = a.id_expediente
        ORDER BY e.created_at DESC
      `;
      
      const result = await pool.query(query);
      
      // Procesar cada expediente para obtener sus requisitos
      const expedientesProcesados = await Promise.all(
        result.rows.map(async (row) => {
          let requisitosExpediente = [];
          
          // Parsear id_requisitos (viene como "1,2,3" o "1, 2, 3")
          if (row.id_requisitos && row.id_requisitos.trim() !== '') {
            const idsRequisitos = row.id_requisitos
              .split(',')
              .map(id => parseInt(id.trim()))
              .filter(id => !isNaN(id));
            
            if (idsRequisitos.length > 0) {
              requisitosExpediente = await this.getRequisitosByIds(idsRequisitos);
            }
          }
          
          // Parsear verificacion_requisitos si es string
          let verificacionRequisitos = [];
          if (row.verificacion_requisitos) {
            if (typeof row.verificacion_requisitos === 'string') {
              try {
                verificacionRequisitos = JSON.parse(row.verificacion_requisitos);
              } catch (e) {
                console.error('Error al parsear verificacion_requisitos:', e);
                verificacionRequisitos = [];
              }
            } else if (Array.isArray(row.verificacion_requisitos)) {
              verificacionRequisitos = row.verificacion_requisitos;
            }
          }
          
          return {
            id_expediente: row.id_expediente,
            codigo_expediente: row.codigo_expediente,
            id_solicitud: row.id_solicitud,
            id_usuario: row.id_usuario,
            id_requisitos: row.id_requisitos,
            estatus: row.estatus,
            observaciones: row.observaciones,
            created_at: row.created_at,
            updated_at: row.updated_at,
            nombres: row.nombres,
            apellidos: row.apellidos,
            email: row.email,
            cedula: row.cedula,
            telefono: row.telefono,
            monto_solicitado: row.monto_solicitado,
            tipo_credito: row.tipo_credito,
            plazo: row.plazo,
            id_aprobacion: row.id_aprobacion,
            estatus_aprobacion: row.estatus_aprobacion || row.estatus || 'Pendiente',
            seleccion_manejo: row.seleccion_manejo,
            requisitos_expediente: requisitosExpediente,
            verificacion_requisitos: verificacionRequisitos
          };
        })
      );
      
      return expedientesProcesados;
    } catch (error) {
      console.error('Error en getAllExpedientes:', error);
      throw error;
    }
  }

  // Obtener requisitos por sus IDs
  static async getRequisitosByIds(idsArray) {
    try {
      if (!idsArray || idsArray.length === 0) return [];
      
      const placeholders = idsArray.map((_, index) => `$${index + 1}`).join(',');
      const query = `
        SELECT 
          id_requisitos,
          nombre_requisito,
          descripcion,
          tipo_requisito
        FROM requisitos 
        WHERE id_requisitos IN (${placeholders})
        ORDER BY id_requisitos
      `;
      
      const result = await pool.query(query, idsArray);
      return result.rows.map(req => ({
        id_requisito: req.id_requisitos,
        nombre: req.nombre_requisito,
        descripcion: req.descripcion || '',
        tipo_requisito: req.tipo_requisito,
        verificado: false
      }));
    } catch (error) {
      console.error('Error en getRequisitosByIds:', error);
      return [];
    }
  }

  // Obtener expediente por ID
  static async getExpedienteById(id) {
    try {
      const query = `
        SELECT 
          e.id_expediente,
          e.codigo_expediente,
          e.id_solicitud,
          e.id_usuario,
          e.id_requisitos,
          e.estatus,
          e.observaciones,
          e.created_at,
          e.updated_at,
          p.nombres,
          p.apellidos,
          p.correo as email,
          p.cedula,
          p.telefono,
          p.direccion,
          s.monto_solicitado,
          a.id_aprobacion,
          a.verificacion_requisitos,
          a.estatus_aprobacion,
          a.seleccion_manejo
        FROM expediente e
        LEFT JOIN persona p ON CAST(e.id_usuario AS VARCHAR) = p.cedula
        LEFT JOIN solicitud s ON e.id_solicitud = s.id_solicitud
        LEFT JOIN aprobacion a ON e.id_expediente = a.id_expediente
        WHERE e.id_expediente = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (!result.rows[0]) return null;
      
      const row = result.rows[0];
      
      // Obtener los requisitos del expediente
      let requisitosExpediente = [];
      if (row.id_requisitos && row.id_requisitos.trim() !== '') {
        const idsRequisitos = row.id_requisitos
          .split(',')
          .map(id => parseInt(id.trim()))
          .filter(id => !isNaN(id));
        
        if (idsRequisitos.length > 0) {
          requisitosExpediente = await this.getRequisitosByIds(idsRequisitos);
        }
      }
      
      // Parsear verificacion_requisitos
      let verificacionRequisitos = [];
      if (row.verificacion_requisitos) {
        if (typeof row.verificacion_requisitos === 'string') {
          try {
            verificacionRequisitos = JSON.parse(row.verificacion_requisitos);
          } catch (e) {
            console.error('Error al parsear verificacion_requisitos:', e);
            verificacionRequisitos = [];
          }
        } else if (Array.isArray(row.verificacion_requisitos)) {
          verificacionRequisitos = row.verificacion_requisitos;
        }
      }
      
      return {
        id_expediente: row.id_expediente,
        codigo_expediente: row.codigo_expediente,
        id_solicitud: row.id_solicitud,
        id_usuario: row.id_usuario,
        id_requisitos: row.id_requisitos,
        estatus: row.estatus,
        observaciones: row.observaciones,
        created_at: row.created_at,
        updated_at: row.updated_at,
        nombres: row.nombres,
        apellidos: row.apellidos,
        email: row.email,
        cedula: row.cedula,
        telefono: row.telefono,
        direccion: row.direccion,
        monto_solicitado: row.monto_solicitado,
        tipo_credito: row.tipo_credito,
        plazo: row.plazo,
        id_aprobacion: row.id_aprobacion,
        estatus_aprobacion: row.estatus_aprobacion || row.estatus || 'Pendiente',
        seleccion_manejo: row.seleccion_manejo,
        requisitos_expediente: requisitosExpediente,
        verificacion_requisitos: verificacionRequisitos
      };
    } catch (error) {
      console.error('Error en getExpedienteById:', error);
      throw error;
    }
  }

  // Obtener todos los requisitos disponibles
  static async getAllRequisitos() {
    try {
      const query = `
        SELECT 
          id_requisitos,
          nombre_requisito,
          descripcion,
          tipo_requisito
        FROM requisitos 
        ORDER BY id_requisitos
      `;
      
      const result = await pool.query(query);
      return result.rows.map(req => ({
        id_requisito: req.id_requisitos,
        nombre: req.nombre_requisito,
        descripcion: req.descripcion || '',
        tipo_requisito: req.tipo_requisito,
        verificado: false
      }));
    } catch (error) {
      console.error('Error en getAllRequisitos:', error);
      throw error;
    }
  }

  // Verificar requisitos y actualizar expediente
static async verificarRequisitos(data) {
  const { 
    id_expediente, 
    requisitos, 
    estatus, 
    seleccion_manejo, 
    observaciones,
    id_inspeccion  // NUEVO: Recibir id_inspeccion
  } = data;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Datos para guardar en modelo:', {
      id_expediente,
      requisitos_length: requisitos?.length,
      estatus,
      seleccion_manejo,
      id_inspeccion
    });
    
    // Verificar si existe registro en aprobacion
    const existente = await client.query(
      'SELECT id_aprobacion, id_inspeccion FROM aprobacion WHERE id_expediente = $1',
      [id_expediente]
    );
    
    // Determinar el id_inspeccion a usar
    let idInspeccionFinal = id_inspeccion;
    
    // Si no se proporciona id_inspeccion pero ya existe uno, mantener el existente
    if (!idInspeccionFinal && existente.rows.length > 0) {
      idInspeccionFinal = existente.rows[0].id_inspeccion;
    }
    
    if (existente.rows.length > 0) {
      // Actualizar existente
      await client.query(
        `UPDATE aprobacion 
         SET verificacion_requisitos = $1,
             estatus_aprobacion = $2,
             seleccion_manejo = $3,
             id_inspeccion = COALESCE($4, id_inspeccion),  -- Solo actualiza si se proporciona
             updated_at = CURRENT_TIMESTAMP
         WHERE id_expediente = $5`,
        [JSON.stringify(requisitos), estatus, seleccion_manejo, idInspeccionFinal, id_expediente]
      );
    } else {
      // Crear nuevo - AHORA CON id_inspeccion
      await client.query(
        `INSERT INTO aprobacion (
          id_expediente, 
          id_inspeccion,
          verificacion_requisitos, 
          estatus_aprobacion, 
          seleccion_manejo
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          id_expediente, 
          idInspeccionFinal,  // NUEVO: Usar el id_inspeccion proporcionado
          JSON.stringify(requisitos), 
          estatus, 
          seleccion_manejo
        ]
      );
    }
    
    // Actualizar el estatus del expediente
    await client.query(
      `UPDATE expediente 
       SET estatus = $1, 
           observaciones = $2, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id_expediente = $3`,
      [estatus, observaciones || '', id_expediente]
    );
    
    await client.query('COMMIT');
    
    // Retornar el expediente actualizado
    return await this.getExpedienteById(id_expediente);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en verificarRequisitos:', error);
    throw error;
  } finally {
    client.release();
  }
}

  // Estadísticas de expedientes
  static async getStatsExpedientes() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*)::integer as total,
          COUNT(CASE WHEN e.estatus = 'Pendiente' THEN 1 END)::integer as pendientes,
          COUNT(CASE WHEN e.estatus = 'En Proceso' THEN 1 END)::integer as en_proceso,
          COUNT(CASE WHEN e.estatus = 'Aprobado' THEN 1 END)::integer as aprobados,
          COUNT(CASE WHEN e.estatus = 'Rechazado' THEN 1 END)::integer as rechazados
        FROM expediente e
      `);
      return result.rows[0];
    } catch (error) {
      console.error('Error en getStatsExpedientes:', error);
      throw error;
    }
  }
}

module.exports = AprobacionModel;