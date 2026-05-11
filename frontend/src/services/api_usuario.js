// services/api_usuario.js
import api from './api_principal';

const usuarioAPI = {
  // ========== AUTENTICACIÓN ==========
  
  // Iniciar sesión
  login: async (cedula_usuario, clave) => {
    try {
      const response = await api.post('/usuarios/login', { cedula_usuario, clave });
      
      if (response.data.success) {
        // Guardar token
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        
        // Guardar información del usuario con datos de persona
        const userData = {
          cedula_usuario: response.data.data.cedula_usuario,
          rol: response.data.data.rol,
          estatus: response.data.data.estatus,
          nombre_completo: response.data.data.nombre_completo || null,
          nombres: response.data.data.nombres || response.data.data.persona?.nombres || null,
          apellidos: response.data.data.apellidos || response.data.data.persona?.apellidos || null,
          ultimo_acceso: response.data.data.ultimo_acceso
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Obtener token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // ========== CRUD USUARIOS ==========

  // Obtener todos los usuarios
  getAllUsuarios: async () => {
    try {
      const response = await api.get('/usuarios');
      return response.data;
    } catch (error) {
      console.error('Error en getAllUsuarios:', error);
      throw error.response?.data || { error: 'Error al obtener los usuarios' };
    }
  },

  // Obtener usuario por ID
  getUsuarioById: async (id) => {
    try {
      const response = await api.get(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en getUsuarioById:', error);
      throw error.response?.data || { error: 'Error al obtener el usuario' };
    }
  },

  // Obtener usuario por cédula
  getUsuarioByCedula: async (cedula_usuario) => {
    try {
      const response = await api.get(`/usuarios/cedula/${cedula_usuario}`);
      
      // Asegurarse de que la respuesta tenga la estructura esperada
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
      const { email, ...dataSinEmail } = usuarioData;
      const response = await api.post('/usuarios', dataSinEmail);
      return response.data;
    } catch (error) {
      console.error('Error en createUsuario:', error);
      throw error.response?.data || { error: 'Error al crear el usuario' };
    }
  },

  // Actualizar usuario
  updateUsuario: async (id, usuarioData) => {
    try {
      const { email, ...dataSinEmail } = usuarioData;
      const response = await api.put(`/usuarios/${id}`, dataSinEmail);
      return response.data;
    } catch (error) {
      console.error('Error en updateUsuario:', error);
      throw error.response?.data || { error: 'Error al actualizar el usuario' };
    }
  },

  // Cambiar contraseña
  updatePassword: async (id, nuevaClave) => {
    try {
      const response = await api.put(`/usuarios/${id}/password`, { nuevaClave });
      return response.data;
    } catch (error) {
      console.error('Error en updatePassword:', error);
      throw error.response?.data || { error: 'Error al cambiar la contraseña' };
    }
  },

  // Cambiar estatus del usuario
  cambiarEstatus: async (id, estatus) => {
    try {
      const response = await api.put(`/usuarios/${id}/estatus`, { estatus });
      return response.data;
    } catch (error) {
      console.error('Error en cambiarEstatus:', error);
      throw error.response?.data || { error: 'Error al cambiar el estatus' };
    }
  },

  // Eliminar usuario
  deleteUsuario: async (id) => {
    try {
      const response = await api.delete(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en deleteUsuario:', error);
      throw error.response?.data || { error: 'Error al eliminar el usuario' };
    }
  },
};

export default usuarioAPI;