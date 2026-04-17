const SolicitudModel = require('../models/solicitudModel');

const solicitudController = {
  // Obtener todas las solicitudes
  async getAll(req, res) {
    try {
      const solicitudes = await SolicitudModel.getAll();
      res.json({ success: true, data: solicitudes });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Obtener solicitud por ID
  async getById(req, res) {
    try {
      const solicitud = await SolicitudModel.getById(req.params.id);
      if (!solicitud) {
        return res.status(404).json({ success: false, error: 'Solicitud no encontrada' });
      }
      res.json({ success: true, data: solicitud });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Obtener solicitudes por cédula de persona
  async getByCedula(req, res) {
    try {
      const solicitudes = await SolicitudModel.getByCedulaPersona(req.params.cedula_persona);
      res.json({ success: true, data: solicitudes });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Crear nueva solicitud
  async create(req, res) {
    try {
      const { cedula_persona, solicitud, fecha_solicitud, monto_solicitado, estatus } = req.body;
      
      const nuevaSolicitud = await SolicitudModel.create({
        cedula_persona,
        solicitud,
        fecha_solicitud,
        monto_solicitado,
        estatus: estatus || 'pendiente'
      });
      
      res.status(201).json({ success: true, data: nuevaSolicitud });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Actualizar solicitud
  async update(req, res) {
    try {
      const { solicitud, fecha_solicitud, monto_solicitado } = req.body;
      const solicitudActualizada = await SolicitudModel.update(req.params.id, {
        solicitud,
        fecha_solicitud,
        monto_solicitado
      });
      
      if (!solicitudActualizada) {
        return res.status(404).json({ success: false, error: 'Solicitud no encontrada' });
      }
      
      res.json({ success: true, data: solicitudActualizada });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Cambiar estatus de solicitud
  async cambiarEstatus(req, res) {
    try {
      const { estatus, motivo_rechazo } = req.body;
      const solicitud = await SolicitudModel.cambiarEstatus(req.params.id, estatus, motivo_rechazo);
      
      if (!solicitud) {
        return res.status(404).json({ success: false, error: 'Solicitud no encontrada' });
      }
      
      res.json({ success: true, data: solicitud });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Eliminar solicitud
  async delete(req, res) {
    try {
      const solicitud = await SolicitudModel.delete(req.params.id);
      if (!solicitud) {
        return res.status(404).json({ success: false, error: 'Solicitud no encontrada' });
      }
      res.json({ success: true, message: 'Solicitud eliminada correctamente' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = solicitudController;