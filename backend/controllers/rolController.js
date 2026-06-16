// backend/controllers/rolController.js
const RolModel = require('../models/rolModel');

const rolController = {
  // Obtener todos los roles
  async getAll(req, res) {
    try {
      const roles = await RolModel.getAll();
      res.json({ success: true, data: roles });
    } catch (error) {
      console.error('Error en getAll roles:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Obtener rol por ID
  async getById(req, res) {
    try {
      const rol = await RolModel.getById(req.params.id);
      if (!rol) {
        return res.status(404).json({ success: false, error: 'Rol no encontrado' });
      }
      res.json({ success: true, data: rol });
    } catch (error) {
      console.error('Error en getById rol:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Crear rol
  async create(req, res) {
    try {
      const { nombre_rol, descripcion } = req.body;
      
      if (!nombre_rol || nombre_rol.trim() === '') {
        return res.status(400).json({ 
          success: false, 
          error: 'El nombre del rol es obligatorio' 
        });
      }

      // Verificar si ya existe el rol
      const existe = await RolModel.getByNombre(nombre_rol);
      if (existe) {
        return res.status(400).json({ 
          success: false, 
          error: 'Ya existe un rol con este nombre' 
        });
      }

      const nuevoRol = await RolModel.create({ nombre_rol, descripcion });
      res.status(201).json({ success: true, data: nuevoRol });
    } catch (error) {
      console.error('Error en create rol:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Actualizar rol
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nombre_rol, descripcion } = req.body;

      if (!nombre_rol || nombre_rol.trim() === '') {
        return res.status(400).json({ 
          success: false, 
          error: 'El nombre del rol es obligatorio' 
        });
      }

      // Verificar si el rol existe
      const rolExistente = await RolModel.getById(id);
      if (!rolExistente) {
        return res.status(404).json({ success: false, error: 'Rol no encontrado' });
      }

      // Verificar si el nuevo nombre ya está en uso por otro rol
      const existe = await RolModel.getByNombre(nombre_rol);
      if (existe && existe.id_rol !== parseInt(id)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Ya existe otro rol con este nombre' 
        });
      }

      const rolActualizado = await RolModel.update(id, { nombre_rol, descripcion });
      res.json({ success: true, data: rolActualizado });
    } catch (error) {
      console.error('Error en update rol:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Eliminar rol
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar si el rol existe
      const rolExistente = await RolModel.getById(id);
      if (!rolExistente) {
        return res.status(404).json({ success: false, error: 'Rol no encontrado' });
      }

      // Verificar si tiene usuarios asignados
      const tieneUsuarios = await RolModel.tieneUsuarios(id);
      if (tieneUsuarios) {
        return res.status(400).json({ 
          success: false, 
          error: 'No se puede eliminar el rol porque tiene usuarios asignados' 
        });
      }

      await RolModel.delete(id);
      res.json({ success: true, message: 'Rol eliminado correctamente' });
    } catch (error) {
      console.error('Error en delete rol:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = rolController;