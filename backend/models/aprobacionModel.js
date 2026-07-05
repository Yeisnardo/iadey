const pool = require("../config/db");

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
            e.urls_imagenes,
            e.estatus,
            e.observaciones,
            e.created_at,
            e.updated_at,
            p.nombres,
            p.apellidos,
            p.correo AS email,
            p.cedula,
            p.telefono,
            s.monto_solicitado,
            s.solicitud,
            s.estatus AS estatus_solicitud,
            a.id_aprobacion,
            a.cedula_persona_id,
            a.verificacion_requisitos,
            a.estatus_aprobacion,
            a.seleccion_manejo,
            ins.estatus_inspeccion,
            ins.id_inspeccion
        FROM expediente e
        LEFT JOIN solicitud s ON e.id_solicitud = s.id_solicitud       
        LEFT JOIN persona p ON s.cedula_persona = p.cedula
        LEFT JOIN aprobacion a ON e.id_expediente = a.id_expediente
        LEFT JOIN inspeccion ins ON e.id_expediente = ins.id_inspeccion
        ORDER BY e.created_at DESC;
      `;
      const result = await pool.query(query);

      // Procesar cada expediente para obtener sus requisitos
      const expedientesProcesados = await Promise.all(
        result.rows.map(async (row) => {
          let requisitosExpediente = [];

          // Parsear id_requisitos (viene como "1,2,3" o "1, 2, 3")
          if (row.id_requisitos && row.id_requisitos.trim() !== "") {
            const idsRequisitos = row.id_requisitos
              .split(",")
              .map((id) => parseInt(id.trim()))
              .filter((id) => !isNaN(id));

            if (idsRequisitos.length > 0) {
              requisitosExpediente =
                await this.getRequisitosByIds(idsRequisitos);
            }
          }

          // Parsear verificacion_requisitos si es string
          let verificacionRequisitos = [];
          if (row.verificacion_requisitos) {
            if (typeof row.verificacion_requisitos === "string") {
              try {
                verificacionRequisitos = JSON.parse(
                  row.verificacion_requisitos,
                );
              } catch (e) {
                console.error("Error al parsear verificacion_requisitos:", e);
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
            solicitud: row.solicitud,
            estatus_solicitud: row.estatus_solicitud,
            estatus_inspeccion: row.estatus_inspeccion,
            id_inspeccion: row.id_inspeccion,
            urls_imagenes: row.urls_imagenes,
            monto_solicitado: row.monto_solicitado,
            id_aprobacion: row.id_aprobacion,
            estatus_aprobacion:
              row.estatus_aprobacion || row.estatus || "Pendiente",
            seleccion_manejo: row.seleccion_manejo,
            cedula_persona_id: row.cedula_persona_id,
            requisitos_expediente: requisitosExpediente,
            verificacion_requisitos: verificacionRequisitos,
          };
        }),
      );

      return expedientesProcesados;
    } catch (error) {
      console.error("Error en getAllExpedientes:", error);
      throw error;
    }
  }

  // Obtener requisitos por sus IDs
  static async getRequisitosByIds(idsArray) {
    try {
      if (!idsArray || idsArray.length === 0) return [];

      const placeholders = idsArray
        .map((_, index) => `$${index + 1}`)
        .join(",");
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
      return result.rows.map((req) => ({
        id_requisito: req.id_requisitos,
        nombre: req.nombre_requisito,
        descripcion: req.descripcion || "",
        tipo_requisito: req.tipo_requisito,
        verificado: false,
      }));
    } catch (error) {
      console.error("Error en getRequisitosByIds:", error);
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
          s.estatus AS estatus_solicitud,
          a.id_aprobacion,
          a.verificacion_requisitos,
          a.estatus_aprobacion,
          a.cedula_persona_id,
          a.seleccion_manejo,
          ins.estatus_inspeccion,
          ins.id_inspeccion
        FROM expediente e
        LEFT JOIN persona p ON CAST(e.id_usuario AS VARCHAR) = p.cedula
        LEFT JOIN solicitud s ON e.id_solicitud = s.id_solicitud
        LEFT JOIN aprobacion a ON e.id_expediente = a.id_expediente
        LEFT JOIN inspeccion ins ON e.id_expediente = ins.id_codigo_exp
        WHERE e.id_expediente = $1
      `;

      const expedienteId = parseInt(id);
      if (isNaN(expedienteId)) {
        throw new Error('ID de expediente inválido');
      }

      const result = await pool.query(query, [expedienteId]);

      if (!result.rows[0]) return null;

      const row = result.rows[0];

      // Obtener los requisitos del expediente
      let requisitosExpediente = [];
      if (row.id_requisitos && row.id_requisitos.trim() !== "") {
        const idsRequisitos = row.id_requisitos
          .split(",")
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id));

        if (idsRequisitos.length > 0) {
          requisitosExpediente = await this.getRequisitosByIds(idsRequisitos);
        }
      }

      // Parsear verificacion_requisitos
      let verificacionRequisitos = [];
      if (row.verificacion_requisitos) {
        if (typeof row.verificacion_requisitos === "string") {
          try {
            verificacionRequisitos = JSON.parse(row.verificacion_requisitos);
          } catch (e) {
            console.error("Error al parsear verificacion_requisitos:", e);
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
        estatus_solicitud: row.estatus_solicitud,
        id_aprobacion: row.id_aprobacion,
        estatus_aprobacion: row.estatus_aprobacion || row.estatus || "Pendiente",
        seleccion_manejo: row.seleccion_manejo,
        cedula_persona_id: row.cedula_persona_id,
        estatus_inspeccion: row.estatus_inspeccion,
        id_inspeccion: row.id_inspeccion,
        requisitos_expediente: requisitosExpediente,
        verificacion_requisitos: verificacionRequisitos,
      };
    } catch (error) {
      console.error("Error en getExpedienteById:", error);
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
      return result.rows.map((req) => ({
        id_requisito: req.id_requisitos,
        nombre: req.nombre_requisito,
        descripcion: req.descripcion || "",
        tipo_requisito: req.tipo_requisito,
        verificado: false,
      }));
    } catch (error) {
      console.error("Error en getAllRequisitos:", error);
      throw error;
    }
  }

  // Verificar requisitos y actualizar expediente, solicitud e inspección
  static async verificarRequisitos(data) {
    const {
      id_expediente,
      requisitos,
      estatus,
      seleccion_manejo,
      cedula_persona_id,
      observaciones,
      id_inspeccion,
      estatus_aprobacion,
      estatus_inspeccion,
    } = data;

    console.log('📥 MODELO - DATOS RECIBIDOS:');
    console.log('cedula_persona_id:', cedula_persona_id);
    console.log('tipo:', typeof cedula_persona_id);
    console.log('id_expediente:', id_expediente);

    // 👇 VALIDACIÓN EN EL MODELO (SIN TRIM)
    if (!cedula_persona_id || cedula_persona_id === '') {
      throw new Error('cedula_persona_id es requerido y no puede estar vacío');
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. ACTUALIZAR TABLA APROBACION
      const existente = await client.query(
        "SELECT id_aprobacion, id_inspeccion FROM aprobacion WHERE id_expediente = $1",
        [id_expediente],
      );

      let idInspeccionFinal = id_inspeccion;

      if (!idInspeccionFinal && existente.rows.length > 0) {
        idInspeccionFinal = existente.rows[0].id_inspeccion;
      }

      const requisitosJSON = JSON.stringify(requisitos.map(req => ({
        id_requisito: req.id_requisito,
        nombre: req.nombre,
        verificado: req.verificado === true,
        estado_verificacion: req.estado_verificacion || (req.verificado ? 'verificado' : 'pendiente'),
        observacion_no_valido: req.observacion_no_valido || null
      })));

      if (existente.rows.length > 0) {
        await client.query(
          `UPDATE aprobacion 
           SET verificacion_requisitos = $1,
               estatus_aprobacion = $2,
               seleccion_manejo = $3,
               id_inspeccion = COALESCE($4, id_inspeccion),
               cedula_persona_id = $5,
               updated_at = CURRENT_TIMESTAMP
           WHERE id_expediente = $6`,
          [
            requisitosJSON, 
            estatus_aprobacion || estatus, 
            seleccion_manejo, 
            idInspeccionFinal, 
            cedula_persona_id,
            id_expediente
          ],
        );
        console.log("✅ Aprobación actualizada con cedula_persona_id:", cedula_persona_id);
      } else {
        await client.query(
          `INSERT INTO aprobacion (
            id_expediente, 
            id_inspeccion,
            cedula_persona_id,
            verificacion_requisitos, 
            estatus_aprobacion, 
            seleccion_manejo
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            id_expediente, 
            idInspeccionFinal, 
            cedula_persona_id,
            requisitosJSON, 
            estatus_aprobacion || estatus, 
            seleccion_manejo
          ],
        );
        console.log("✅ Nueva aprobación creada con cedula_persona_id:", cedula_persona_id);
      }

      // 2. ACTUALIZAR TABLA EXPEDIENTE
      await client.query(
        `UPDATE expediente 
         SET estatus = $1, 
             observaciones = $2, 
             updated_at = CURRENT_TIMESTAMP 
         WHERE id_expediente = $3`,
        [estatus, observaciones || "", id_expediente],
      );
      console.log("✅ Expediente actualizado");

      // 3. ACTUALIZAR TABLA SOLICITUD
      const expedienteInfo = await client.query(
        "SELECT id_solicitud FROM expediente WHERE id_expediente = $1",
        [id_expediente]
      );

      if (expedienteInfo.rows.length > 0 && expedienteInfo.rows[0].id_solicitud) {
        await client.query(
          `UPDATE solicitud 
           SET estatus = $1,
               updated_at = CURRENT_TIMESTAMP
           WHERE id_solicitud = $2`,
          [estatus, expedienteInfo.rows[0].id_solicitud]
        );
        console.log("✅ Solicitud actualizada");
      }

      // 4. ACTUALIZAR TABLA INSPECCIÓN
      if (estatus_inspeccion) {
        console.log("Intentando actualizar estatus_inspeccion a:", estatus_inspeccion);
        
        const inspeccionExistente = await client.query(
          "SELECT id_inspeccion FROM inspeccion WHERE id_inspeccion = $1",
          [idInspeccionFinal]
        );
        
        console.log("Inspección encontrada:", inspeccionExistente.rows);
        
        if (inspeccionExistente.rows.length > 0) {
          const updateResult = await client.query(
            `UPDATE inspeccion 
             SET estatus_inspeccion = $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id_inspeccion = $2
             RETURNING *`,
            [estatus_inspeccion, idInspeccionFinal]
          );
          console.log("✅ Inspección actualizada:", updateResult.rows[0]);
        } else {
          const insertResult = await client.query(
            `INSERT INTO inspeccion (
              id_inspeccion,
              estatus_inspeccion,
              created_at,
              updated_at
            ) VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *`,
            [idInspeccionFinal, estatus_inspeccion]
          );
          console.log("✅ Nueva inspección creada:", insertResult.rows[0]);
        }
      } else {
        console.log("⚠️ No se recibió estatus_inspeccion para actualizar");
      }

      await client.query("COMMIT");
      console.log("=== TRANSACCIÓN COMPLETADA EXITOSAMENTE ===");

      return await this.getExpedienteById(id_expediente);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error en verificarRequisitos:", error);
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
      console.error("Error en getStatsExpedientes:", error);
      throw error;
    }
  }
}

module.exports = AprobacionModel;