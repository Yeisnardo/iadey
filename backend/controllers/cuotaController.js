const CuotaModel = require('../models/cuotaModel');

const cuotaController = {
  // Obtener todos los contratos con sus cuotas
  async getAll(req, res) {
    try {
      await CuotaModel.actualizarEstadosMora();
      
      const contratos = await CuotaModel.getAll();
      
      const contratosConCuotas = await Promise.all(
        contratos.map(async (contrato) => {
          try {
            const cuotas = await CuotaModel.getCuotasByContratoId(contrato.id_contrato);
            return {
              ...contrato,
              cuotas: cuotas || []
            };
          } catch (error) {
            console.error(`Error obteniendo cuotas para contrato ${contrato.id_contrato}:`, error);
            return {
              ...contrato,
              cuotas: []
            };
          }
        })
      );
      
      res.json({ success: true, data: contratosConCuotas });
    } catch (error) {
      console.error('Error en getAll:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        details: 'Error al obtener los contratos'
      });
    }
  },

  // Obtener contratos por cédula de aprobación
async getByCedulaAprob(req, res) {
  try {
    const { id_cedula_aprob } = req.params;
    
    if (!id_cedula_aprob) {
      return res.status(400).json({ 
        success: false, 
        error: 'ID de cédula de aprobación requerido' 
      });
    }
    
    // Actualizar estados de mora primero
    await CuotaModel.actualizarEstadosMora();
    
    // Obtener contratos por cédula
    const contratos = await CuotaModel.getByCedulaAprob(id_cedula_aprob);
    
    // Obtener cuotas para cada contrato
    const contratosConCuotas = await Promise.all(
      contratos.map(async (contrato) => {
        try {
          const cuotas = await CuotaModel.getCuotasByContratoId(contrato.id_contrato);
          return {
            ...contrato,
            cuotas: cuotas || []
          };
        } catch (error) {
          console.error(`Error obteniendo cuotas para contrato ${contrato.id_contrato}:`, error);
          return {
            ...contrato,
            cuotas: []
          };
        }
      })
    );
    
    res.json({ success: true, data: contratosConCuotas });
  } catch (error) {
    console.error('Error en getByCedulaAprob:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: 'Error al obtener los contratos por cédula'
    });
  }
},

  // Obtener cuotas de un contrato específico
  async getCuotasByContrato(req, res) {
    try {
      const { id_contrato } = req.params;
      
      if (!id_contrato) {
        return res.status(400).json({ 
          success: false, 
          error: 'ID de contrato requerido' 
        });
      }
      
      await CuotaModel.actualizarEstadosMora();
      const cuotas = await CuotaModel.getCuotasByContratoId(id_contrato);
      
      res.json({ success: true, data: cuotas });
    } catch (error) {
      console.error('Error en getCuotasByContrato:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  // Registrar pago de cuota
  async registrarPago(req, res) {
    try {
      const { id_cuota } = req.params;
      
      if (!id_cuota) {
        return res.status(400).json({ 
          success: false, 
          error: 'ID de cuota requerido' 
        });
      }
      
      // Obtener los datos del pago del body
      const {
        fecha_pagada,
        dias_mora_cuota,
        monto_morosidad,
        comprobante
      } = req.body;
      
      // Validar datos requeridos
      if (!fecha_pagada) {
        return res.status(400).json({
          success: false,
          error: 'La fecha de pago es requerida'
        });
      }
      
      console.log('=== REGISTRANDO PAGO DESDE CONTROLLER ===');
      console.log('ID Cuota:', id_cuota);
      console.log('Datos recibidos:', req.body);
      
      // Registrar el pago en el modelo (esto también recalcula las gracias)
      const cuotaActualizada = await CuotaModel.registrarPago(id_cuota, {
        fecha_pagada,
        dias_mora_cuota: dias_mora_cuota || 0,
        monto_morosidad: monto_morosidad || '0',
        comprobante: comprobante || null
      });
      
      // Actualizar estados de mora
      await CuotaModel.actualizarEstadosMora();
      
      // Obtener todas las cuotas actualizadas del contrato
      const cuotasActualizadas = await CuotaModel.getCuotasByContratoId(
        cuotaActualizada.id_cuota_cont
      );
      
      const mensaje = cuotaActualizada.cuotas_gracia_actualizadas?.length > 0
        ? `Pago registrado exitosamente. Se recalcul${cuotaActualizada.cuotas_gracia_actualizadas.length === 1 ? 'ó' : 'aron'} ${cuotaActualizada.cuotas_gracia_actualizadas.length} cuota(s) de gracia.`
        : 'Pago registrado exitosamente';
      
      res.json({ 
        success: true, 
        message: mensaje,
        data: {
          cuota_pagada: cuotaActualizada,
          cuotas_gracia_actualizadas: cuotaActualizada.cuotas_gracia_actualizadas || [],
          todas_las_cuotas: cuotasActualizadas
        }
      });
      
    } catch (error) {
      console.error('Error en registrarPago:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message || 'Error al registrar el pago' 
      });
    }
  },

  // Generar cuotas para un contrato
  async generarCuotasManual(req, res) {
    try {
      const { id_contrato } = req.params;
      const configuracion = req.body;
      
      console.log('=== GENERANDO CUOTAS MANUALES (CONTROLLER) ===');
      console.log('ID Contrato:', id_contrato);
      console.log('Configuración recibida:', JSON.stringify(configuracion, null, 2));
      
      if (!id_contrato) {
        return res.status(400).json({ 
          success: false, 
          error: 'ID de contrato requerido' 
        });
      }
      
      // Validar configuración
      if (!configuracion.cantidadCuotas || configuracion.cantidadCuotas <= 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Cantidad de cuotas obligatorias inválida' 
        });
      }
      
      if (!configuracion.fechaPrimeraCuota) {
        return res.status(400).json({ 
          success: false, 
          error: 'Fecha de primera cuota requerida' 
        });
      }
      
      const cuotasGeneradas = await CuotaModel.generarCuotasManual(id_contrato, configuracion);
      
      res.json({ 
        success: true, 
        message: `${cuotasGeneradas.length} cuotas generadas exitosamente`,
        data: cuotasGeneradas 
      });
      
    } catch (error) {
      console.error('Error en generarCuotasManual:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  // Actualizar todas las cuotas en mora
  async actualizarMora(req, res) {
    try {
      await CuotaModel.actualizarEstadosMora();
      res.json({ 
        success: true, 
        message: 'Estados de mora actualizados correctamente' 
      });
    } catch (error) {
      console.error('Error en actualizarMora:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  // Endpoint de prueba para recalcular gracias
  async testRecalculo(req, res) {
    try {
      const { id_contrato } = req.params;
      
      console.log('=== TEST RECALCULO ===');
      console.log('ID Contrato:', id_contrato);
      
      const resultado = await CuotaModel.recalcularCuotasGracia(id_contrato);
      
      // Obtener todas las cuotas para verificar
      const cuotas = await CuotaModel.getCuotasByContratoId(id_contrato);
      
      const resumen = {
        total_obligatorias: cuotas
          .filter(c => c.tipo_cuota === 'Obligatoria')
          .reduce((sum, c) => sum + parseFloat(c.monto_cuota), 0),
        total_gracias: cuotas
          .filter(c => c.tipo_cuota === 'Gracias')
          .reduce((sum, c) => sum + parseFloat(c.monto_cuota), 0),
        total_general: cuotas.reduce((sum, c) => sum + parseFloat(c.monto_cuota), 0),
        cuotas_actualizadas: resultado,
        todas_las_cuotas: cuotas.map(c => ({
          numero: c.num_cuota,
          tipo: c.tipo_cuota,
          monto: c.monto_cuota,
          estado: c.estado_cuota
        }))
      };
      
      res.json({ success: true, data: resumen });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = cuotaController;