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
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const { 
        fecha_pagada,
        dias_mora_cuota,
        monto_morosidad,
        comprobante
      } = datosPago;
      
      console.log('=== REGISTRANDO PAGO ===');
      console.log('ID Cuota:', id_cuota);
      console.log('Fecha Pago:', fecha_pagada);
      console.log('Días Mora:', dias_mora_cuota);
      console.log('Monto Morosidad:', monto_morosidad);
      
      // 1. Registrar el pago de la cuota
      const pagoQuery = `
        UPDATE cuota 
        SET 
          estado_cuota = 'pagado',
          fecha_pagada = $1,
          dias_mora_cuota = $2,
          monto_morosidad = $3,
          comprobante = $4
        WHERE id_cuota = $5
        RETURNING *
      `;
      
      const pagoValues = [
        fecha_pagada,
        dias_mora_cuota || 0,
        monto_morosidad || '0',
        comprobante || null,
        id_cuota
      ];
      
      const pagoResult = await client.query(pagoQuery, pagoValues);
      
      if (pagoResult.rows.length === 0) {
        throw new Error('Cuota no encontrada');
      }
      
      const cuotaPagada = pagoResult.rows[0];
      console.log('✅ Cuota pagada exitosamente');
      console.log('Número Cuota:', cuotaPagada.num_cuota);
      console.log('Tipo Cuota:', cuotaPagada.tipo_cuota);
      console.log('Monto Cuota:', cuotaPagada.monto_cuota);
      console.log('ID Contrato:', cuotaPagada.id_cuota_cont);
      
      // 2. Recalcular cuotas de gracia (usando el monto total original)
      const cuotasGraciaActualizadas = await this.recalcularCuotasGracia(
        cuotaPagada.id_cuota_cont, 
        client
      );
      
      console.log('✅ Cuotas de gracia recalculadas:', cuotasGraciaActualizadas.length);
      
      // 3. Verificar si todas las cuotas están pagadas para actualizar el contrato
      const checkCuotasQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN estado_cuota = 'pagado' THEN 1 END) as pagadas
        FROM cuota 
        WHERE id_cuota_cont = $1
      `;
      const checkResult = await client.query(checkCuotasQuery, [cuotaPagada.id_cuota_cont]);
      const { total, pagadas } = checkResult.rows[0];
      
      console.log('Total cuotas:', total);
      console.log('Cuotas pagadas:', pagadas);
      
      // Si todas las cuotas están pagadas, actualizar contrato a 'Terminado'
      if (parseInt(total) === parseInt(pagadas)) {
        await client.query(
          `UPDATE contrato 
           SET estatus = 'Terminado',
               cierre = $1,
               updated_at = CURRENT_TIMESTAMP
           WHERE id_contrato = $2`,
          [fecha_pagada, cuotaPagada.id_cuota_cont]
        );
        console.log('🏁 Contrato marcado como Terminado');
      } else {
        // Si no está completamente pagado, asegurar que esté como 'Activo'
        await client.query(
          `UPDATE contrato 
           SET estatus = 'Activo',
               updated_at = CURRENT_TIMESTAMP
           WHERE id_contrato = $1 AND estatus = 'En espera de cuotas'`,
          [cuotaPagada.id_cuota_cont]
        );
      }
      
      await client.query('COMMIT');
      
      return {
        ...cuotaPagada,
        cuotas_gracia_actualizadas: cuotasGraciaActualizadas
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error en registrarPago:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Recalcular cuotas de gracia basado en el MONTO TOTAL ORIGINAL
// Recalcular SOLO cuotas de gracia basado en el MONTO TOTAL ORIGINAL
// Recalcular SOLO cuotas de gracia: SaldoPendiente / TotalGracias
static async recalcularCuotasGracia(id_contrato, client = null) {
    const dbClient = client || pool;
    const useTransaction = !client;
    
    try {
      if (useTransaction) {
        await dbClient.query('BEGIN');
      }
      
      console.log('=== RECALCULANDO CUOTAS GRACIA ===');
      console.log('ID Contrato:', id_contrato);
      
      // 1. Obtener TODAS las cuotas del contrato
      const cuotasQuery = `
        SELECT 
          id_cuota, 
          num_cuota, 
          tipo_cuota, 
          monto_cuota, 
          estado_cuota
        FROM cuota 
        WHERE id_cuota_cont = $1 
        ORDER BY CAST(num_cuota AS INTEGER) ASC
      `;
      const cuotasResult = await dbClient.query(cuotasQuery, [id_contrato]);
      const cuotas = cuotasResult.rows;
      
      // 2. Obtener datos del contrato
      const contratoQuery = `
        SELECT 
          devolvimiento, 
          monto_moneda,
          numero_gracias
        FROM contrato 
        WHERE id_contrato = $1
      `;
      const contratoResult = await dbClient.query(contratoQuery, [id_contrato]);
      const contrato = contratoResult.rows[0];
      
      const montoTotalOriginal = parseFloat(contrato.devolvimiento) || parseFloat(contrato.monto_moneda) || 0;
      const totalGracias = parseInt(contrato.numero_gracias) || 0;
      
      console.log('Monto Total Original:', montoTotalOriginal.toFixed(2));
      console.log('Total Gracias del contrato:', totalGracias);
      
      // Si no hay gracias configuradas, salir
      if (totalGracias === 0) {
        console.log('El contrato no tiene cuotas de gracia configuradas');
        if (useTransaction) await dbClient.query('COMMIT');
        return [];
      }
      
      // 3. Calcular el SALDO PENDIENTE (lo que falta por pagar)
      const cuotasPagadas = cuotas.filter(c => c.estado_cuota === 'pagado');
      const montoTotalPagado = cuotasPagadas.reduce(
        (sum, c) => sum + parseFloat(c.monto_cuota), 0
      );
      
      const saldoPendiente = montoTotalOriginal - montoTotalPagado;
      
      console.log('Cuotas Pagadas:', cuotasPagadas.length);
      console.log('Monto Total Pagado:', montoTotalPagado.toFixed(2));
      console.log('Saldo Pendiente:', saldoPendiente.toFixed(2));
      
      // 4. Filtrar SOLO las gracias PENDIENTES (no pagadas)
      const cuotasGracia = cuotas.filter(c => c.tipo_cuota === 'Gracias');
      const cuotasGraciaPendientes = cuotasGracia.filter(c => c.estado_cuota !== 'pagado');
      
      console.log('Total Cuotas Gracia:', cuotasGracia.length);
      console.log('Cuotas Gracia Pendientes:', cuotasGraciaPendientes.length);
      
      // Si no hay gracias pendientes, nada que recalcular
      if (cuotasGraciaPendientes.length === 0) {
        console.log('Todas las cuotas de gracia están pagadas');
        if (useTransaction) await dbClient.query('COMMIT');
        return [];
      }
      
      // 5. CALCULAR: SaldoPendiente / TotalGracias (del contrato)
      const montoPorGracia = saldoPendiente / totalGracias;
      
      console.log('=== CÁLCULO ===');
      console.log('Saldo Pendiente:', saldoPendiente.toFixed(2));
      console.log('÷ Total Gracias:', totalGracias);
      console.log('= Monto por Gracia:', montoPorGracia.toFixed(2));
      
      // 6. Actualizar TODAS las cuotas de gracia (PENDIENTES) con el nuevo monto
      const cuotasActualizadas = [];
      
      for (const cuota of cuotasGraciaPendientes) {
        const updateQuery = `
          UPDATE cuota 
          SET monto_cuota = $1
          WHERE id_cuota = $2
          RETURNING id_cuota, num_cuota, monto_cuota, tipo_cuota, estado_cuota
        `;
        
        const result = await dbClient.query(updateQuery, [
          montoPorGracia.toFixed(2),
          cuota.id_cuota
        ]);
        
        cuotasActualizadas.push(result.rows[0]);
        console.log(`✅ Cuota Gracia #${cuota.num_cuota}: $${montoPorGracia.toFixed(2)}`);
      }
      
      // 7. Verificación final
      console.log('=== VERIFICACIÓN ===');
      const cuotasVerificacion = await dbClient.query(cuotasQuery, [id_contrato]);
      
      const totalObligatorias = cuotasVerificacion.rows
        .filter(c => c.tipo_cuota === 'Obligatoria')
        .reduce((sum, c) => sum + parseFloat(c.monto_cuota), 0);
      
      const totalGraciasVer = cuotasVerificacion.rows
        .filter(c => c.tipo_cuota === 'Gracias')
        .reduce((sum, c) => sum + parseFloat(c.monto_cuota), 0);
      
      console.log('Total Obligatorias:', totalObligatorias.toFixed(2));
      console.log('Total Gracias:', totalGraciasVer.toFixed(2));
      console.log('Gran Total:', (totalObligatorias + totalGraciasVer).toFixed(2));
      
      if (useTransaction) {
        await dbClient.query('COMMIT');
      }
      
      return cuotasActualizadas;
      
    } catch (error) {
      if (useTransaction) {
        await dbClient.query('ROLLBACK');
      }
      console.error('❌ Error en recalcularCuotasGracia:', error);
      throw error;
    }
  }

  // Generar cuotas para un contrato
  static async generarCuotasManual(id_contrato, configuracion) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      console.log('=== GENERANDO CUOTAS MANUALES ===');
      console.log('ID Contrato:', id_contrato);
      console.log('Configuración:', JSON.stringify(configuracion, null, 2));
      
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
      
      console.log('Cuotas Obligatorias a generar:', cuotasObligatorias);
      console.log('Cuotas Gracia a generar:', cuotasGracia);
      console.log('Total Cuotas:', totalCuotas);
      console.log('Monto Total:', montoTotal);
      console.log('Monto por Cuota Obligatoria:', montoObligatorio.toFixed(2));
      console.log('Monto por Cuota Gracia:', montoGracia.toFixed(2));
      
      // Obtener el máximo id_cuota
      const maxIdQuery = 'SELECT COALESCE(MAX(id_cuota), 0) as max_id FROM cuota';
      const maxIdResult = await client.query(maxIdQuery);
      let nextId = parseInt(maxIdResult.rows[0].max_id) + 1;
      
      const cuotasGeneradas = [];
      let fechaActual = new Date(configuracion.fechaPrimeraCuota);
      const frecuencia = configuracion.frecuencia || 'mensual';
      
      // Generar todas las cuotas (obligatorias + gracias)
      for (let i = 0; i < totalCuotas; i++) {
        const numeroCuota = i + 1;
        let tipoCuota = '';
        let montoCuota = 0;
        
        // Las primeras 'cuotasObligatorias' son obligatorias
        // Las siguientes 'cuotasGracia' son de gracia
        if (numeroCuota <= cuotasObligatorias) {
          tipoCuota = 'Obligatoria';
          montoCuota = montoObligatorio;
        } else {
          tipoCuota = 'Gracias';
          montoCuota = montoGracia;
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
      
      // Verificación: Asegurar que la suma total = montoTotal
      const sumaTotal = cuotasGeneradas.reduce((sum, c) => sum + c.monto, 0);
      console.log('=== VERIFICACIÓN DE MONTOS ===');
      console.log('Suma total de cuotas generadas:', sumaTotal.toFixed(2));
      console.log('Monto total del préstamo:', montoTotal.toFixed(2));
      console.log('Diferencia:', (sumaTotal - montoTotal).toFixed(2));
      
      // Si hay diferencia, ajustar la última cuota de gracia
      if (Math.abs(sumaTotal - montoTotal) > 0.01) {
        const diferencia = montoTotal - sumaTotal;
        console.log('⚠️ Ajustando diferencia de:', diferencia.toFixed(2));
        
        // Buscar la última cuota de gracia (o la última cuota si no hay gracias)
        const ultimaCuotaGracia = [...cuotasGeneradas].reverse().find(c => c.tipo === 'Gracias');
        const cuotaAAjustar = ultimaCuotaGracia || cuotasGeneradas[cuotasGeneradas.length - 1];
        
        const nuevoMonto = cuotaAAjustar.monto + diferencia;
        console.log(`Ajustando cuota #${cuotaAAjustar.numero} de ${cuotaAAjustar.monto.toFixed(2)} a ${nuevoMonto.toFixed(2)}`);
        
        // Actualizar en la base de datos
        await client.query(
          `UPDATE cuota SET monto_cuota = $1 WHERE id_cuota = $2`,
          [nuevoMonto.toFixed(2), cuotaAAjustar.id_cuota]
        );
        
        // Actualizar en el array local
        cuotaAAjustar.monto = nuevoMonto;
      }
      
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
      
      console.log('✅ Cuotas generadas exitosamente');
      return cuotasGeneradas;
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error en generarCuotasManual:', error);
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
      
      // Período de gracia: 5 días sin mora
      if (diffDays <= 5) {
        return {
          dias_mora: 0,
          monto_morosidad: '0'
        };
      }
      
      // Calcular mora con interés compuesto diario (5% mensual)
      const tasaMensual = 0.05; // 5% mensual
      const tasaDiaria = Math.pow(1 + tasaMensual, 1/30) - 1;
      const factor = Math.pow(1 + tasaDiaria, diffDays);
      const montoMora = parseFloat(montoCuota) * (factor - 1);
      
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
      WHERE estado_cuota IN ('pendiente', 'en_mora', 'vencido')
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
        
        if (nuevoEstado !== cuota.estado_cuota || dias_mora > 0) {
          const updateQuery = `
            UPDATE cuota 
            SET estado_cuota = $1, 
                dias_mora_cuota = $2, 
                monto_morosidad = $3
            WHERE id_cuota = $4
          `;
          await pool.query(updateQuery, [nuevoEstado, dias_mora, monto_morosidad, cuota.id_cuota]);
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