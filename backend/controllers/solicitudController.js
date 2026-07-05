// controllers/solicitudController.js
const SolicitudModel = require('../models/SolicitudModel');

const solicitudController = {

  // GET /api/solicitud/aprobadas
  getAprobadas: async (req, res) => {
    try {
      const solicitudes = await SolicitudModel.getAprobadas();
      res.json({
        success: true,
        data: solicitudes,
        count: solicitudes.length,
        message: 'Solicitudes aprobadas obtenidas exitosamente'
      });
    } catch (error) {
      console.error('Error en getAprobadas:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET /api/solicitud
  getAll: async (req, res) => {
    try {
      const solicitudes = await SolicitudModel.getAll();
      res.json({
        success: true,
        data: solicitudes,
        message: 'Solicitudes obtenidas exitosamente'
      });
    } catch (error) {
      console.error('Error en getAll:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET /api/solicitud/cedula/:cedula - CORREGIDO
  getByCedula: async (req, res) => {
    try {
      const { cedula } = req.params;
      
      // Validar que la cédula no esté vacía
      if (!cedula || cedula.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Cédula no proporcionada'
        });
      }
      
      const solicitudes = await SolicitudModel.getByCedula(cedula.trim());
      
      res.json({
        success: true,
        data: solicitudes,
        count: solicitudes.length
      });
    } catch (error) {
      console.error('Error en getByCedula:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // POST /api/solicitud
  create: async (req, res) => {
    try {
      const solicitud = await SolicitudModel.create(req.body);
      res.status(201).json({
        success: true,
        data: solicitud,
        message: 'Solicitud creada exitosamente'
      });
    } catch (error) {
      console.error('Error en create:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // PUT /api/solicitud/:id
  update: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validar que el ID sea un número
      const id_solicitud = parseInt(id);
      if (isNaN(id_solicitud)) {
        return res.status(400).json({
          success: false,
          error: 'ID de solicitud inválido'
        });
      }
      
      const solicitud = await SolicitudModel.update(id_solicitud, req.body);
      
      if (!solicitud) {
        return res.status(404).json({
          success: false,
          error: 'Solicitud no encontrada'
        });
      }
      
      res.json({
        success: true,
        data: solicitud,
        message: 'Solicitud actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error en update:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // PUT /api/solicitud/:id/estatus - CORREGIDO
  updateEstatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { estatus, motivo_rechazo } = req.body;
      
      // Validar que el ID sea un número
      const id_solicitud = parseInt(id);
      if (isNaN(id_solicitud)) {
        return res.status(400).json({
          success: false,
          error: 'ID de solicitud inválido'
        });
      }
      
      // Validar que el estatus sea válido
      const estatusPermitidos = ['Pendiente', 'Pre-Aprobado', 'Rechazado'];
      if (!estatusPermitidos.includes(estatus)) {
        return res.status(400).json({
          success: false,
          error: 'Estatus no válido. Los valores permitidos son: Pendiente, Pre-Aprobado, Rechazado'
        });
      }
      
      // Si el estatus es Rechazado, validar que tenga motivo
      if (estatus === 'Rechazado' && (!motivo_rechazo || motivo_rechazo.trim() === '')) {
        return res.status(400).json({
          success: false,
          error: 'Debe proporcionar un motivo de rechazo'
        });
      }
      
      const solicitud = await SolicitudModel.cambiarEstatus(id_solicitud, estatus, motivo_rechazo);
      
      if (!solicitud) {
        return res.status(404).json({
          success: false,
          error: 'Solicitud no encontrada'
        });
      }
      
      // Mensaje según el estatus
      let mensaje = '';
      if (estatus === 'Pre-Aprobado') {
        mensaje = 'Solicitud pre-aprobada exitosamente';
      } else if (estatus === 'Rechazado') {
        mensaje = 'Solicitud rechazada exitosamente';
      } else {
        mensaje = 'Estatus actualizado exitosamente';
      }
      
      res.json({
        success: true,
        data: solicitud,
        message: mensaje
      });
    } catch (error) {
      console.error('Error en updateEstatus:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // DELETE /api/solicitud/:id
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Validar que el ID sea un número
      const id_solicitud = parseInt(id);
      if (isNaN(id_solicitud)) {
        return res.status(400).json({
          success: false,
          error: 'ID de solicitud inválido'
        });
      }
      
      const solicitud = await SolicitudModel.delete(id_solicitud);
      
      if (!solicitud) {
        return res.status(404).json({
          success: false,
          error: 'Solicitud no encontrada'
        });
      }
      
      res.json({
        success: true,
        message: 'Solicitud eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error en delete:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = solicitudController;