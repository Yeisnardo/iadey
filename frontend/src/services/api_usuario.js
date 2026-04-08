import api from '../services/api_principal';

const usuarioAPI = {
  // ========== AUTENTICACIÓN ==========
  
  // Iniciar sesión (ahora usando cédula en lugar de email)
  login: async (cedula_usuario, clave) => {
    try {
      const response = await api.post('/login', { cedula_usuario, clave });
      if (response.data.success) {
        // Guardar token y datos del usuario
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error.response?.data || { error: 'Error al iniciar sesión' };
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

  // Obtener usuario por cédula (reemplaza a getUsuarioByEmail)
  getUsuarioByCedula: async (cedula_usuario) => {
    try {
      const response = await api.get(`/usuarios/cedula/${cedula_usuario}`);
      return response.data;
    } catch (error) {
      console.error('Error en getUsuarioByCedula:', error);
      throw error.response?.data || { error: 'Error al obtener el usuario por cédula' };
    }
  },

  // Crear nuevo usuario (sin email)
  createUsuario: async (usuarioData) => {
    try {
      // Asegurarse de que no se envíe email
      const { email, ...dataSinEmail } = usuarioData;
      const response = await api.post('/usuarios', dataSinEmail);
      return response.data;
    } catch (error) {
      console.error('Error en createUsuario:', error);
      throw error.response?.data || { error: 'Error al crear el usuario' };
    }
  },

  // Actualizar usuario (sin email)
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

  // Cambiar estatus del usuario (activo, inactivo, bloqueado)
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