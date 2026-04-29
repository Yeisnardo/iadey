// controllers/solicitudController.js
const SolicitudModel = require('../models/SolicitudModel');

const solicitudController = {


  // Agregar este método a tu solicitudController existente

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

  // GET /api/solicitud/emprendedores
  getEmprendedores: async (req, res) => {
    try {
      const emprendedores = await SolicitudModel.getEmprendedores();
      res.json({
        success: true,
        data: emprendedores,
        message: 'Emprendedores obtenidos exitosamente'
      });
    } catch (error) {
      console.error('Error en getEmprendedores:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET /api/solicitud/:id
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const solicitud = await SolicitudModel.getById(id);
      
      if (!solicitud) {
        return res.status(404).json({
          success: false,
          error: 'Solicitud no encontrada'
        });
      }
      
      res.json({
        success: true,
        data: solicitud
      });
    } catch (error) {
      console.error('Error en getById:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // GET /api/solicitud/cedula/:cedula
  getByCedula: async (req, res) => {
    try {
      const { cedula } = req.params;
      const solicitudes = await SolicitudModel.getByCedulaPersona(cedula);
      
      res.json({
        success: true,
        data: solicitudes
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
      const solicitud = await SolicitudModel.update(id, req.body);
      
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

  // PUT /api/solicitud/:id/estatus
  updateEstatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { estatus, motivo_rechazo } = req.body;
      
      // Validar que el estatus sea válido
      const estatusPermitidos = ['Pendiente', 'Aprobado', 'Rechazado'];
      if (!estatusPermitidos.includes(estatus)) {
        return res.status(400).json({
          success: false,
          error: 'Estatus no válido. Los valores permitidos son: Pendiente, Aprobado, Rechazado'
        });
      }
      
      // Si el estatus es Rechazado, validar que tenga motivo
      if (estatus === 'Rechazado' && (!motivo_rechazo || motivo_rechazo.trim() === '')) {
        return res.status(400).json({
          success: false,
          error: 'Debe proporcionar un motivo de rechazo'
        });
      }
      
      const solicitud = await SolicitudModel.cambiarEstatus(id, estatus, motivo_rechazo);
      
      if (!solicitud) {
        return res.status(404).json({
          success: false,
          error: 'Solicitud no encontrada'
        });
      }
      
      res.json({
        success: true,
        data: solicitud,
        message: `Solicitud ${estatus === 'Aprobado' ? 'aprobada' : 'rechazada'} exitosamente`
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
      const solicitud = await SolicitudModel.delete(id);
      
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