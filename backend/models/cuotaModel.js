const pool = require('../config/db');

class CuotaModel {
  // Obtener todos los contratos con los estatus específicos
  static async getAll() {
    const query = `
      SELECT 
        a.id_aprobacion,
        a.id_inspeccion,
        a.id_expediente,
        a.verificacion_requisitos,
        a.estatus_aprobacion,
        a.seleccion_manejo,
        a.created_at as aprobacion_created_at,
        a.updated_at as aprobacion_updated_at,
        c.id_contrato,
        c.numero_contrato,
        c.moneda,
        c.monto_moneda,
        c.cambio,
        c.flat,
        c.interes,
        c.devolvimiento,
        c.numero_cuotas,
        c.numero_gracias,
        c.inicio,
        c.cierre,
        c.estatus,
        c.created_at as contrato_created_at,
        c.updated_at as contrato_updated_at,
        d.id_desembolso,
        d.fecha_desembolso,
        d.capture_desembolso,
        d.estatus_desembolso,
        d.fecha_confirmacion
      FROM aprobacion a
      INNER JOIN contrato c ON a.id_aprobacion = c.id_aprob
      LEFT JOIN desembolso d ON c.id_contrato = d.id_cont
      WHERE c.estatus IN ('En espera de cuotas', 'Activo', 'Terminado')
      ORDER BY a.id_aprobacion DESC
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error en getAll query:', error);
      throw error;
    }
  }

  // Obtener cuotas de un contrato específico
  static async getCuotasByContratoId(id_contrato) {
    const query = `
      SELECT 
        id_cuota,
        id_cuota_cont,
        num_cuota,
        fecha_desde,
        fecha_hasta,
        monto_cuota,
        monte_bs,
        fecha_pagada,
        estado_cuota,
        tipo_cuota,
        dias_mora_cuota,
        monto_morosidad,
        comprobante
      FROM cuota
      WHERE id_cuota_cont = $1
      ORDER BY CAST(num_cuota AS INTEGER) ASC
    `;
    
    try {
      const result = await pool.query(query, [id_contrato]);
      return result.rows;
    } catch (error) {
      console.error(`Error en getCuotasByContratoId para id_contrato ${id_contrato}:`, error);
      return [];
    }
  }

  // Registrar pago de una cuota
  static async registrarPago(id_cuota, datosPago) {
    const { 
      fecha_pago, 
      comprobante,
      monto_morosidad = '0'
    } = datosPago;
    
    const query = `
      UPDATE cuota 
      SET 
        estado_cuota = 'pagado',
        fecha_pagada = $1,
        comprobante = $2,
        monto_morosidad = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id_cuota = $4
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, [
        fecha_pago, 
        comprobante,
        monto_morosidad,
        id_cuota
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error en registrarPago:', error);
      throw error;
    }
  }

  // Generar cuotas para un contrato - VERSIÓN CORREGIDA (SUMA)
  static async generarCuotasManual(id_contrato, configuracion) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Verificar si ya existen cuotas
      const checkQuery = 'SELECT COUNT(*) as total FROM cuota WHERE id_cuota_cont = $1';
      const checkResult = await client.query(checkQuery, [id_contrato]);
      const existingCount = parseInt(checkResult.rows[0].total);
      
      if (existingCount > 0) {
        throw new Error('Este contrato ya tiene cuotas generadas');
      }
      
      // Obtener datos del contrato
      const contratoQuery = `
        SELECT 
          id_contrato,
          monto_moneda,
          interes,
          devolvimiento,
          numero_cuotas,
          numero_gracias,
          inicio
        FROM contrato 
        WHERE id_contrato = $1
      `;
      const contratoResult = await client.query(contratoQuery, [id_contrato]);
      const contrato = contratoResult.rows[0];
      
      if (!contrato) {
        throw new Error('Contrato no encontrado');
      }
      
      // Obtener configuración
      const cuotasObligatorias = parseInt(configuracion.cantidadCuotas) || 0;
      const cuotasGracia = parseInt(contrato.numero_gracias) || 0;
      
      // TOTAL DE CUOTAS A GENERAR = OBLIGATORIAS + GRACIAS
      const totalCuotas = cuotasObligatorias + cuotasGracia;
      
      // Monto total del préstamo
      const montoTotal = parseFloat(contrato.devolvimiento) || parseFloat(contrato.monto_moneda) || 0;
      
      // Calcular montos
      const montoObligatorio = cuotasObligatorias > 0 ? montoTotal / cuotasObligatorias : 0;
      const montoGracia = cuotasGracia > 0 ? montoTotal / cuotasGracia : 0;
      
      console.log('=== GENERANDO CUOTAS ===');
      console.log('Cuotas Obligatorias:', cuotasObligatorias);
      console.log('Cuotas Gracia:', cuotasGracia);
      console.log('Total Cuotas a generar:', totalCuotas);
      console.log('Monto Total:', montoTotal);
      console.log('Monto por Cuota Obligatoria:', montoObligatorio);
      console.log('Monto por Cuota Gracia:', montoGracia);
      
      // Obtener el máximo id_cuota
      const maxIdQuery = 'SELECT COALESCE(MAX(id_cuota), 0) as max_id FROM cuota';
      const maxIdResult = await client.query(maxIdQuery);
      let nextId = parseInt(maxIdResult.rows[0].max_id) + 1;
      
      const cuotasGeneradas = [];
      let fechaActual = new Date(configuracion.fechaPrimeraCuota);
      const frecuencia = configuracion.frecuencia || 'mensual';
      
      let totalObligatoriasGeneradas = 0;
      let totalGraciasGeneradas = 0;
      
      // Generar todas las cuotas (obligatorias + gracias)
      for (let i = 0; i < totalCuotas; i++) {
        const numeroCuota = i + 1;
        let tipoCuota = '';
        let montoCuota = 0;
        
        // Las primeras 'cuotasObligatorias' son obligatorias
        // Las siguientes 'cuotasGracia' son de gracia (SE SUMAN)
        if (numeroCuota <= cuotasObligatorias) {
          tipoCuota = 'Obligatoria';
          montoCuota = montoObligatorio;
          totalObligatoriasGeneradas += montoCuota;
        } else {
          tipoCuota = 'Gracias';
          montoCuota = montoGracia;
          totalGraciasGeneradas += montoCuota;
        }
        
        // Calcular fechas según la frecuencia
        let fechaDesde = new Date(fechaActual);
        let fechaHasta = new Date(fechaActual);
        
        switch(frecuencia) {
          case 'mensual':
            fechaHasta.setMonth(fechaHasta.getMonth() + 1);
            fechaHasta.setDate(fechaHasta.getDate() - 1);
            break;
          case 'quincenal':
            fechaHasta.setDate(fechaHasta.getDate() + 14);
            break;
          case 'semanal':
            fechaHasta.setDate(fechaHasta.getDate() + 6);
            break;
          default:
            fechaHasta.setMonth(fechaHasta.getMonth() + 1);
            fechaHasta.setDate(fechaHasta.getDate() - 1);
        }
        
        const fechaDesdeStr = fechaDesde.toISOString().split('T')[0];
        const fechaHastaStr = fechaHasta.toISOString().split('T')[0];
        
        const insertQuery = `
          INSERT INTO cuota (
            id_cuota,
            id_cuota_cont, 
            num_cuota, 
            fecha_desde,
            fecha_hasta,
            monto_cuota,
            estado_cuota,
            tipo_cuota,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
          RETURNING id_cuota
        `;
        
        const result = await client.query(insertQuery, [
          nextId++,
          id_contrato,
          numeroCuota.toString(),
          fechaDesdeStr,
          fechaHastaStr,
          montoCuota.toFixed(2),
          'pendiente',
          tipoCuota
        ]);
        
        cuotasGeneradas.push({
          id_cuota: result.rows[0].id_cuota,
          numero: numeroCuota,
          tipo: tipoCuota,
          fecha_desde: fechaDesdeStr,
          fecha_hasta: fechaHastaStr,
          monto: montoCuota
        });
        
        // Avanzar fecha para la siguiente cuota
        switch(frecuencia) {
          case 'mensual':
            fechaActual.setMonth(fechaActual.getMonth() + 1);
            break;
          case 'quincenal':
            fechaActual.setDate(fechaActual.getDate() + 15);
            break;
          case 'semanal':
            fechaActual.setDate(fechaActual.getDate() + 7);
            break;
        }
      }
      
      console.log('=== RESUMEN FINAL ===');
      console.log('Total Obligatorias generadas:', totalObligatoriasGeneradas);
      console.log('Total Gracias generadas:', totalGraciasGeneradas);
      console.log('Total General:', totalObligatoriasGeneradas + totalGraciasGeneradas);
      console.log('Monto Total Original:', montoTotal);
      
      // Actualizar estatus del contrato
      await client.query(
        `UPDATE contrato 
         SET estatus = 'Activo', 
             numero_cuotas = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id_contrato = $2`,
        [totalCuotas, id_contrato]
      );
      
      await client.query('COMMIT');
      return cuotasGeneradas;
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error en generarCuotasManual:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Calcular días de mora y monto de morosidad
  static calcularMora(fechaVencimiento, montoCuota, fechaActual = new Date()) {
    const vencimiento = new Date(fechaVencimiento);
    const hoy = new Date(fechaActual);
    hoy.setHours(0, 0, 0, 0);
    vencimiento.setHours(0, 0, 0, 0);
    
    if (hoy > vencimiento) {
      const diffTime = Math.abs(hoy - vencimiento);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const periodosMora = Math.ceil(diffDays / 30);
      const montoMora = parseFloat(montoCuota) * 0.05 * periodosMora;
      
      return {
        dias_mora: diffDays,
        monto_morosidad: montoMora.toFixed(2)
      };
    }
    
    return {
      dias_mora: 0,
      monto_morosidad: '0'
    };
  }

  // Actualizar estado de mora para todas las cuotas pendientes
  static async actualizarEstadosMora() {
    const query = `
      SELECT id_cuota, id_cuota_cont, fecha_desde, fecha_hasta, monto_cuota, estado_cuota
      FROM cuota
      WHERE estado_cuota IN ('pendiente', 'en_mora')
    `;
    
    try {
      const cuotas = await pool.query(query);
      
      for (const cuota of cuotas.rows) {
        const fechaVencimiento = cuota.fecha_hasta;
        const { dias_mora, monto_morosidad } = this.calcularMora(fechaVencimiento, cuota.monto_cuota);
        
        let nuevoEstado = cuota.estado_cuota;
        if (dias_mora > 0 && cuota.estado_cuota !== 'pagado') {
          nuevoEstado = dias_mora > 30 ? 'vencido' : 'en_mora';
        } else if (dias_mora === 0 && cuota.estado_cuota !== 'pagado') {
          nuevoEstado = 'pendiente';
        }
        
        if (nuevoEstado !== cuota.estado_cuota) {
          const updateQuery = `
            UPDATE cuota 
            SET estado_cuota = $1, 
                dias_mora_cuota = $2, 
                monto_morosidad = $3
            WHERE id_cuota = $4
          `;
          await pool.query(updateQuery, [nuevoEstado, dias_mora, monto_morosidad]);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error en actualizarEstadosMora:', error);
      throw error;
    }
  }
}

module.exports = CuotaModel;