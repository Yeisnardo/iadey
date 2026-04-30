// backend/controllers/inspeccionController.js
const InspeccionModel = require('../models/inspeccionModel');

const inspeccionController = {
  // Obtener todas las inspecciones
  async getAll(req, res) {
    try {
      const inspecciones = await InspeccionModel.getAll();
      res.json({ success: true, data: inspecciones });
    } catch (error) {
      console.error('Error al obtener inspecciones:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Obtener una inspección por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const inspeccion = await InspeccionModel.getById(id);
      if (!inspeccion) {
        return res.status(404).json({ success: false, error: 'Inspección no encontrada' });
      }
      res.json({ success: true, data: inspeccion });
    } catch (error) {
      console.error('Error al obtener inspección:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Obtener inspecciones por expediente
  async getByExpediente(req, res) {
    try {
      const { id_expediente } = req.params;
      const inspecciones = await InspeccionModel.getByExpediente(id_expediente);
      res.json({ success: true, data: inspecciones });
    } catch (error) {
      console.error('Error al obtener inspecciones por expediente:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Obtener datos del emprendimiento para preparar inspección
  async getEmprendimientoData(req, res) {
    try {
      const { id_expediente } = req.params;
      const data = await InspeccionModel.getEmprendimientoData(id_expediente);
      if (!data) {
        return res.status(404).json({ success: false, error: 'Emprendimiento no encontrado' });
      }
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error al obtener datos del emprendimiento:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Crear nueva inspección
  async create(req, res) {
    try {
      const inspeccion = await InspeccionModel.create(req.body);
      res.json({ success: true, data: inspeccion, message: 'Inspección creada exitosamente' });
    } catch (error) {
      console.error('Error al crear inspección:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Actualizar inspección
  async update(req, res) {
    try {
      const { id } = req.params;
      const inspeccion = await InspeccionModel.update(id, req.body);
      if (!inspeccion) {
        return res.status(404).json({ success: false, error: 'Inspección no encontrada' });
      }
      res.json({ success: true, data: inspeccion, message: 'Inspección actualizada exitosamente' });
    } catch (error) {
      console.error('Error al actualizar inspección:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Guardar resultados de inspección
  async saveInspectionResults(req, res) {
    try {
      const { id } = req.params;
      const { results } = req.body;
      const inspeccion = await InspeccionModel.saveInspectionResults(id, results);
      if (!inspeccion) {
        return res.status(404).json({ success: false, error: 'Inspección no encontrada' });
      }
      res.json({ success: true, data: inspeccion, message: 'Resultados guardados exitosamente' });
    } catch (error) {
      console.error('Error al guardar resultados:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = inspeccionController;