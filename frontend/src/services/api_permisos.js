// services/api_permisos.js - Versión actualizada

import api from './api_principal';

const permisosAPI = {
  // Obtener todos los permisos (ahora desde la tabla Permisos)
  getAllPermisos: async () => {
    try {
      const response = await api.get('/permisos');
      return { 
        success: true, 
        data: response.data.data // Array de {id_permisos, id_roles, menu_item_id, acciones}
      };
    } catch (error) {
      console.error('Error en getAllPermisos:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al obtener los permisos' 
      };
    }
  },

  // Obtener permisos por rol
  getPermisosByRol: async (idRol) => {
    try {
      const response = await api.get(`/permisos/rol/${idRol}`);
      return { 
        success: true, 
        data: response.data.data // Permisos del rol específico
      };
    } catch (error) {
      console.error('Error en getPermisosByRol:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al obtener los permisos del rol' 
      };
    }
  },

  // Obtener permisos de un usuario (a través de su rol)
  getPermisosByUsuario: async (idUsuario) => {
    try {
      const response = await api.get(`/permisos/usuario/${idUsuario}`);
      return { 
        success: true, 
        data: response.data.data // Permisos del usuario según su rol
      };
    } catch (error) {
      console.error('Error en getPermisosByUsuario:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al obtener los permisos del usuario' 
      };
    }
  },

  // Asignar/actualizar permisos de un rol
  asignarPermisosRol: async (idRol, permisos) => {
    try {
      // permisos debe ser un array de {menu_item_id, acciones}
      const response = await api.post(`/permisos/rol/${idRol}`, { permisos });
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error en asignarPermisosRol:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al asignar permisos al rol' 
      };
    }
  },

  // Asignar permisos a un usuario (cambia su rol)
  asignarPermisosUsuario: async (idUsuario, idRol) => {
    try {
      // En tu estructura, los permisos se asignan mediante el rol
      const response = await api.put(`/permisos/usuario/${idUsuario}/rol`, { id_rol: idRol });
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error en asignarPermisosUsuario:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al asignar permisos al usuario' 
      };
    }
  },

  // Verificar si un usuario tiene un permiso específico
  verificarPermiso: async (idUsuario, menuItemId, accion) => {
    try {
      const response = await api.get(`/permisos/verificar/${idUsuario}/${menuItemId}/${accion}`);
      return { 
        success: true, 
        tienePermiso: response.data.tiene_permiso 
      };
    } catch (error) {
      console.error('Error en verificarPermiso:', error);
      return { 
        success: false, 
        tienePermiso: false,
        error: error.response?.data?.error || 'Error al verificar permiso' 
      };
    }
  },

  // Obtener todos los roles disponibles
  getRoles: async () => {
    try {
      const response = await api.get('/roles');
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error en getRoles:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al obtener los roles' 
      };
    }
  },

  // Crear un nuevo rol
  createRol: async (nombreRol) => {
    try {
      const response = await api.post('/roles', { nombre_rol: nombreRol });
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error en createRol:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al crear el rol' 
      };
    }
  },

  // Actualizar un rol
  updateRol: async (idRol, nombreRol) => {
    try {
      const response = await api.put(`/roles/${idRol}`, { nombre_rol: nombreRol });
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error en updateRol:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al actualizar el rol' 
      };
    }
  },

  // Eliminar un rol
  deleteRol: async (idRol) => {
    try {
      const response = await api.delete(`/roles/${idRol}`);
      return { success: true, message: 'Rol eliminado correctamente' };
    } catch (error) {
      console.error('Error en deleteRol:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al eliminar el rol' 
      };
    }
  }
};

export default permisosAPI;