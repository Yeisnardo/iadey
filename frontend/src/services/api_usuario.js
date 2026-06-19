// services/api_usuario.js
import api from './api_principal';

const usuarioAPI = {
  // ========== AUTENTICACIÓN ==========
  
  // Iniciar sesión
  login: async (cedula_usuario, clave) => {
    try {
      const response = await api.post('/usuarios/login', { cedula_usuario, clave });
      
      console.log('Respuesta del login:', response.data); // Para depuración
      
      if (response.data.success) {
        // Guardar token
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        
        // Obtener datos del usuario de la respuesta
        const userDataFromResponse = response.data.data;
        
        // Determinar el rol correctamente
        let roleName = 'Usuario';
        
        // Prioridades para obtener el nombre del rol:
        if (userDataFromResponse.rol) {
          roleName = userDataFromResponse.rol;
        } else if (userDataFromResponse.nombre_rol) {
          roleName = userDataFromResponse.nombre_rol;
        } else if (userDataFromResponse.id_rol_usu) {
          // Mapeo de roles según tu base de datos
          const roleMap = {
            1: 'Administrador',
            2: 'Administrador',
            3: 'Emprendedor',
            4: 'Admin'
          };
          roleName = roleMap[userDataFromResponse.id_rol_usu] || `Rol ${userDataFromResponse.id_rol_usu}`;
        }
        
        // Construir objeto de usuario con todos los datos necesarios
        const userToStore = {
          cedula_usuario: userDataFromResponse.cedula_usuario,
          id_rol_usu: userDataFromResponse.id_rol_usu,
          estatus: userDataFromResponse.estatus,
          ultimo_acceso: userDataFromResponse.ultimo_acceso,
          // Datos personales
          nombres: userDataFromResponse.nombres || userDataFromResponse.persona?.nombres || '',
          apellidos: userDataFromResponse.apellidos || userDataFromResponse.persona?.apellidos || '',
          nombre_completo: userDataFromResponse.nombre_completo || 
            userDataFromResponse.persona?.nombre_completo || 
            `${userDataFromResponse.nombres || ''} ${userDataFromResponse.apellidos || ''}`.trim(),
          // ROL (guardar en ambos campos para compatibilidad)
          rol: roleName,
          nombre_rol: roleName,
          // Datos adicionales de persona (si están disponibles)
          persona: userDataFromResponse.persona || null
        };
        
        console.log('Usuario a guardar:', userToStore); // Para depuración
        
        // Guardar en localStorage
        localStorage.setItem('user', JSON.stringify(userToStore));
        
        // También guardar el rol por separado para fácil acceso
        localStorage.setItem('userRole', roleName);
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
    localStorage.removeItem('userRole');
  },

  // Obtener usuario actual (mejorado)
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    if (!user) return null;
    
    try {
      const userData = JSON.parse(user);
      
      // Asegurar que el rol esté presente
      if (!userData.rol && userData.nombre_rol) {
        userData.rol = userData.nombre_rol;
      }
      
      if (!userData.rol && userData.id_rol_usu) {
        const roleMap = {
          1: 'Administrador',
          2: 'Administrador',
          3: 'Emprendedor'
        };
        userData.rol = roleMap[userData.id_rol_usu] || 'Usuario';
        // Guardar de vuelta para futuras lecturas
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      // Si aún no tiene rol, asignar 'Usuario' por defecto
      if (!userData.rol) {
        userData.rol = 'Usuario';
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      return userData;
    } catch (error) {
      console.error('Error al parsear usuario:', error);
      return null;
    }
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

  getRoles: async () => {
    try {
      const response = await api.get('/usuarios/roles');
      return response.data;
    } catch (error) {
      console.error('Error en getRoles:', error);
      throw error.response?.data || { error: 'Error al obtener los roles' };
    }
  },
};

export default usuarioAPI;