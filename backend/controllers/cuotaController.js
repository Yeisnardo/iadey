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
      const datosPago = req.body;
      
      if (!id_cuota) {
        return res.status(400).json({ 
          success: false, 
          error: 'ID de cuota requerido' 
        });
      }
      
      const cuotaActualizada = await CuotaModel.registrarPago(id_cuota, datosPago);
      await CuotaModel.actualizarEstadosMora();
      
      res.json({ 
        success: true, 
        message: 'Pago registrado exitosamente',
        data: cuotaActualizada 
      });
    } catch (error) {
      console.error('Error en registrarPago:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  // Generar cuotas para un contrato
  async generarCuotasManual(req, res) {
    try {
      const { id_contrato } = req.params;
      const configuracion = req.body;
      
      console.log('Configuración recibida:', configuracion);
      
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
  }
};

module.exports = cuotaController;