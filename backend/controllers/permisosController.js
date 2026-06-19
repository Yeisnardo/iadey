// controllers/permisosController.js - Versión actualizada

const PermisosModel = require('../models/permisosModel');

const permisosController = {
  // Obtener todos los permisos del sistema
  async getAllPermisos(req, res) {
    try {
      const permisos = await PermisosModel.getPermisosAgrupadosPorRol();
      res.json({ success: true, data: permisos });
    } catch (error) {
      console.error('Error en getAllPermisos:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Obtener permisos de un rol específico
  async getPermisosByRol(req, res) {
    try {
      const { idRol } = req.params;
      const permisos = await PermisosModel.getPermisosByRol(idRol);
      
      // Formatear para el frontend
      const permisosFormateados = permisos.map(p => ({
        ...p,
        acciones_array: p.acciones ? p.acciones.split(',').map(a => a.trim()) : []
      }));
      
      res.json({ success: true, data: permisosFormateados });
    } catch (error) {
      console.error('Error en getPermisosByRol:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Asignar permisos a un rol
  async asignarPermisosRol(req, res) {
    try {
      const { idRol } = req.params;
      const { permisos } = req.body;
      
      if (!permisos || !Array.isArray(permisos)) {
        return res.status(400).json({ 
          success: false, 
          error: 'El campo "permisos" debe ser un array de {menu_item_id, acciones}' 
        });
      }

      // Validar formato de permisos
      for (const permiso of permisos) {
        if (!permiso.menu_item_id || !permiso.acciones) {
          return res.status(400).json({
            success: false,
            error: 'Cada permiso debe tener menu_item_id y acciones'
          });
        }
      }

      await PermisosModel.asignarPermisosRol(idRol, permisos);
      
      res.json({ 
        success: true, 
        message: 'Permisos asignados correctamente al rol' 
      });
    } catch (error) {
      console.error('Error en asignarPermisosRol:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Obtener permisos de un usuario
  async getPermisosByUsuario(req, res) {
    try {
      const { idUsuario } = req.params;
      const permisos = await PermisosModel.getPermisosByUsuario(idUsuario);
      
      // Formatear para el frontend
      const permisosFormateados = permisos.map(p => ({
        menu_item_id: p.menu_item_id,
        acciones_array: p.acciones ? p.acciones.split(',').map(a => a.trim()) : []
      }));
      
      res.json({ success: true, data: permisosFormateados });
    } catch (error) {
      console.error('Error en getPermisosByUsuario:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Verificar si un usuario tiene un permiso específico
  async verificarPermiso(req, res) {
    try {
      const { idUsuario, menuItemId, accion } = req.params;
      const tienePermiso = await PermisosModel.verificarPermiso(idUsuario, menuItemId, accion);
      res.json({ success: true, tiene_permiso: tienePermiso });
    } catch (error) {
      console.error('Error en verificarPermiso:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // CRUD de Roles
  async getRoles(req, res) {
    try {
      const roles = await PermisosModel.getAllRoles();
      res.json({ success: true, data: roles });
    } catch (error) {
      console.error('Error en getRoles:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createRol(req, res) {
    try {
      const { nombre_rol } = req.body;
      
      if (!nombre_rol) {
        return res.status(400).json({ 
          success: false, 
          error: 'El nombre del rol es obligatorio' 
        });
      }

      const nuevoRol = await PermisosModel.createRol(nombre_rol);
      res.status(201).json({ success: true, data: nuevoRol });
    } catch (error) {
      console.error('Error en createRol:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async updateRol(req, res) {
    try {
      const { id } = req.params;
      const { nombre_rol } = req.body;
      
      if (!nombre_rol) {
        return res.status(400).json({ 
          success: false, 
          error: 'El nombre del rol es obligatorio' 
        });
      }

      const rolActualizado = await PermisosModel.updateRol(id, nombre_rol);
      
      if (!rolActualizado) {
        return res.status(404).json({ 
          success: false, 
          error: 'Rol no encontrado' 
        });
      }
      
      res.json({ success: true, data: rolActualizado });
    } catch (error) {
      console.error('Error en updateRol:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async deleteRol(req, res) {
    try {
      const { id } = req.params;
      const rolEliminado = await PermisosModel.deleteRol(id);
      
      if (!rolEliminado) {
        return res.status(404).json({ 
          success: false, 
          error: 'Rol no encontrado' 
        });
      }
      
      res.json({ success: true, message: 'Rol eliminado correctamente' });
    } catch (error) {
      console.error('Error en deleteRol:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = permisosController;