// controllers/aprobacionController.js
const AprobacionModel = require('../models/aprobacionModel');
const pool = require('../config/db');

const aprobacionController = {
  // Obtener todas las aprobaciones
  getAll: async (req, res) => {
    try {
      const aprobaciones = await AprobacionModel.getAll();
      res.json({ 
        success: true, 
        data: aprobaciones,
        total: aprobaciones.length
      });
    } catch (error) {
      console.error('Error en getAll aprobaciones:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  // Obtener aprobación por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const aprobacion = await AprobacionModel.getById(id);
      
      if (!aprobacion) {
        return res.status(404).json({ 
          success: false, 
          error: 'Aprobación no encontrada' 
        });
      }
      
      res.json({ 
        success: true, 
        data: aprobacion 
      });
    } catch (error) {
      console.error('Error en getById aprobacion:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  },

  // Verificar requisitos y crear/actualizar aprobación
  verificarRequisitos: async (req, res) => {
    try {
      const { id_expediente, requisitos, observaciones, seleccion_manejo } = req.body;
      
      // Validar datos requeridos
      if (!id_expediente || !requisitos || !Array.isArray(requisitos)) {
        return res.status(400).json({
          success: false,
          error: 'El id_expediente y los requisitos (como arreglo) son requeridos'
        });
      }
      
      // Validar seleccion_manejo si todos los requisitos están verificados
      const todosVerificados = requisitos.every(r => r.verificado === true);
      if (todosVerificados && !seleccion_manejo) {
        return res.status(400).json({
          success: false,
          error: 'Debe seleccionar el tipo de manejo (Interno o Banco) cuando todos los requisitos están verificados'
        });
      }
      
      // Validar que seleccion_manejo tenga un valor válido
      if (seleccion_manejo && !['Interno', 'Banco'].includes(seleccion_manejo)) {
        return res.status(400).json({
          success: false,
          error: 'El tipo de manejo debe ser Interno o Banco'
        });
      }
      
      // Determinar el estatus basado en los requisitos verificados
      const algunosVerificados = requisitos.some(r => r.verificado === true);
      
      let estatus_aprobacion;
      if (todosVerificados) {
        estatus_aprobacion = 'Aprobado';
      } else if (algunosVerificados) {
        estatus_aprobacion = 'En Proceso';
      } else {
        estatus_aprobacion = 'Pendiente';
      }
      
      // Preparar el objeto de verificación de requisitos
      const verificacion_requisitos = requisitos.map(req => ({
        id_requisito: req.id_requisito,
        nombre: req.nombre || '',
        verificado: req.verificado
      }));
      
      // Guardar en la tabla aprobacion
      const aprobacion = await AprobacionModel.upsert({
        id_expediente,
        verificacion_requisitos,
        estatus_aprobacion,
        seleccion_manejo: seleccion_manejo || null
      });
      
      // Actualizar el estatus del expediente y observaciones
      await pool.query(
        `UPDATE expediente 
        SET estatus = $1, observaciones = $2, updated_at = CURRENT_TIMESTAMP 
        WHERE id_expediente = $3`,
        [estatus_aprobacion, observaciones || '', id_expediente]
      );
      
      res.json({
        success: true,
        data: aprobacion,
        message: `Verificación de requisitos guardada. Estatus: ${estatus_aprobacion}${seleccion_manejo ? '. Manejo: ' + seleccion_manejo : ''}`
      });
    } catch (error) {
      console.error('Error en verificarRequisitos:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Obtener estadísticas
  getStats: async (req, res) => {
    try {
      const stats = await AprobacionModel.getStats();
      res.json({ 
        success: true, 
        data: stats 
      });
    } catch (error) {
      console.error('Error en getStats aprobaciones:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
};

module.exports = aprobacionController;