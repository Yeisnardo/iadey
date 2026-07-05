// services/api_usuario.js - Versión corregida
import api from './api_principal';

const usuarioAPI = {
  // ========== AUTENTICACIÓN ==========
  
  // Iniciar sesión
  // services/api_usuario.js - Método login CORREGIDO

login: async (cedula_usuario, clave) => {
  try {
    const response = await api.post('/usuarios/login', { cedula_usuario, clave });
    
    console.log('Respuesta del login API:', response.data);
    
    if (response.data.success) {
      const userData = response.data.data || response.data.usuario || {};
      
      // Guardar token si existe
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      // Construir objeto de usuario con todos los datos necesarios
      const userToStore = {
        id: userData.id || userData.id_usuario,
        cedula_usuario: userData.cedula_usuario,
        id_rol_usu: userData.id_rol_usu || userData.id_rol || 1,
        nombre_rol: userData.nombre_rol || userData.rol || 'Usuario',
        estatus: userData.estatus || 'activo',
        ultimo_acceso: userData.ultimo_acceso || new Date().toISOString(),
        nombres: userData.nombres || '',
        apellidos: userData.apellidos || '',
        nombre_completo: userData.nombre_completo || 
          `${userData.nombres || ''} ${userData.apellidos || ''}`.trim(),
        email: userData.correo || userData.email || '',
        telefono: userData.telefono || '',
        persona: userData.persona || null
      };
      
      console.log('Usuario a guardar:', userToStore);
      
      // Guardar en localStorage
      localStorage.setItem('usuario', JSON.stringify(userToStore));
      localStorage.setItem('user', JSON.stringify(userToStore));
      localStorage.setItem('userRole', userToStore.nombre_rol);
      localStorage.setItem('userId', userToStore.id);
      
      // Disparar evento de cambio de autenticación
      window.dispatchEvent(new Event('authChange'));
      
      return {
        success: true,
        data: userToStore,
        token: response.data.token
      };
    }
    
    return response.data;
    
  } catch (error) {
    console.error('Error en login:', error);
    
    if (error.response?.status === 401) {
      return {
        success: false,
        error: 'Credenciales incorrectas',
        message: error.response?.data?.message || 'Las credenciales son incorrectas'
      };
    }
    
    if (error.response?.data) {
      return {
        success: false,
        error: error.response.data.error || 'Error al iniciar sesión',
        message: error.response.data.message || 'Error de conexión con el servidor'
      };
    }
    
    return {
      success: false,
      error: 'Error de conexión',
      message: 'No se pudo conectar con el servidor. Verifica tu conexión.'
    };
  }
},

  // Cerrar sesión
  logout: () => {
    try {
      // Limpiar localStorage
      localStorage.removeItem('usuario');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('rememberToken');
      
      // Disparar evento de cambio de autenticación
      window.dispatchEvent(new Event('authChange'));
      
      return true;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      return false;
    }
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    // Intentar obtener de 'usuario' primero, luego de 'user'
    let user = localStorage.getItem('usuario');
    
    if (!user) {
      user = localStorage.getItem('user');
    }
    
    if (!user) return null;
    
    try {
      const userData = JSON.parse(user);
      
      // Asegurar que el ID esté presente
      if (!userData.id) {
        userData.id = localStorage.getItem('userId');
      }
      
      // Asegurar que el rol esté presente
      if (!userData.rol && !userData.nombre_rol) {
        userData.rol = localStorage.getItem('userRole') || 'Usuario';
        userData.nombre_rol = userData.rol;
      }
      
      if (!userData.nombre_rol && userData.rol) {
        userData.nombre_rol = userData.rol;
      }
      
      if (!userData.rol && userData.nombre_rol) {
        userData.rol = userData.nombre_rol;
      }
      
      return userData;
    } catch (error) {
      console.error('Error al parsear usuario:', error);
      return null;
    }
  },

  // Obtener ID del usuario actual
  getCurrentUserId: () => {
    const user = usuarioAPI.getCurrentUser();
    return user?.id || localStorage.getItem('userId') || null;
  },

  // Obtener rol del usuario actual
  getCurrentUserRole: () => {
    const user = usuarioAPI.getCurrentUser();
    return user?.nombre_rol || user?.rol || localStorage.getItem('userRole') || null;
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!(localStorage.getItem('token') && 
              (localStorage.getItem('usuario') || localStorage.getItem('user')));
  },

  // Obtener token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Actualizar datos del usuario en localStorage
  updateLocalUser: (userData) => {
    try {
      const currentUser = usuarioAPI.getCurrentUser();
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('usuario', JSON.stringify(updatedUser));
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      if (userData.nombre_rol || userData.rol) {
        localStorage.setItem('userRole', userData.nombre_rol || userData.rol);
      }
      
      window.dispatchEvent(new Event('authChange'));
      return updatedUser;
    } catch (error) {
      console.error('Error al actualizar usuario local:', error);
      return null;
    }
  },

  // ========== CRUD USUARIOS ==========

  // Obtener todos los usuarios
  getAllUsuarios: async () => {
    try {
      const response = await api.get('/usuarios');
      return response.data;
    } catch (error) {
      console.error('Error en getAllUsuarios:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener los usuarios'
      };
    }
  },

  // Obtener usuario por ID
  getUsuarioById: async (id) => {
    try {
      const response = await api.get(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en getUsuarioById:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener el usuario'
      };
    }
  },

  // Obtener usuario por cédula
  getUsuarioByCedula: async (cedula_usuario) => {
    try {
      const response = await api.get(`/usuarios/cedula/${cedula_usuario}`);
      
      if (response.data && response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Error en getUsuarioByCedula:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener el usuario por cédula'
      };
    }
  },

  // Crear nuevo usuario
  createUsuario: async (usuarioData) => {
    try {
      const { email, correo, ...dataSinEmail } = usuarioData;
      const response = await api.post('/usuarios', dataSinEmail);
      return response.data;
    } catch (error) {
      console.error('Error en createUsuario:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al crear el usuario'
      };
    }
  },

  // Actualizar usuario
  updateUsuario: async (id, usuarioData) => {
    try {
      const { email, correo, ...dataSinEmail } = usuarioData;
      const response = await api.put(`/usuarios/${id}`, dataSinEmail);
      return response.data;
    } catch (error) {
      console.error('Error en updateUsuario:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al actualizar el usuario'
      };
    }
  },

  // Cambiar contraseña
  updatePassword: async (id, nuevaClave) => {
    try {
      const response = await api.put(`/usuarios/${id}/password`, { nuevaClave });
      return response.data;
    } catch (error) {
      console.error('Error en updatePassword:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al cambiar la contraseña'
      };
    }
  },

  // Cambiar estatus del usuario
  cambiarEstatus: async (id, estatus) => {
    try {
      const response = await api.put(`/usuarios/${id}/estatus`, { estatus });
      return response.data;
    } catch (error) {
      console.error('Error en cambiarEstatus:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al cambiar el estatus'
      };
    }
  },

  // Eliminar usuario
  deleteUsuario: async (id) => {
    try {
      const response = await api.delete(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en deleteUsuario:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al eliminar el usuario'
      };
    }
  },

  // Obtener roles (desde el endpoint de usuarios)
  getRoles: async () => {
    try {
      const response = await api.get('/usuarios/roles');
      return response.data;
    } catch (error) {
      console.error('Error en getRoles:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener los roles'
      };
    }
  },

  // ========== PERMISOS (Métodos helper) ==========
  
  // Obtener permisos del usuario actual
  getMyPermissions: async () => {
    try {
      const userId = usuarioAPI.getCurrentUserId();
      if (!userId) {
        return { success: false, error: 'Usuario no autenticado' };
      }
      
      const response = await api.get(`/permisos/usuario/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error en getMyPermissions:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener permisos'
      };
    }
  },

  // Verificar si el usuario actual tiene un permiso específico
  checkPermission: async (menuItemId, accion) => {
    try {
      const userId = usuarioAPI.getCurrentUserId();
      if (!userId) return false;
      
      const response = await api.get(`/permisos/verificar/${userId}/${menuItemId}/${accion}`);
      return response.data?.tiene_permiso || false;
    } catch (error) {
      console.error('Error en checkPermission:', error);
      return false;
    }
  }
};

export default usuarioAPI;