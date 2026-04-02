import axios from 'axios';

// Detectar URL del backend según entorno
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://backend-prueba-lwhh.onrender.com';
  }
  return 'http://localhost:5000';
};

const API_BASE_URL = getBaseUrl();

console.log(`🌐 API URL: ${API_BASE_URL}`);

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============================================
// SERVICIOS DE USUARIO
// ============================================

// Crear un nuevo usuario
const createUsuario = async (usuario) => {
  const response = await api.post('/api/usuarios', usuario);
  return response.data;
};

// Obtener un usuario por cédula
const getUsuario = async (cedula_usuario) => {
  const response = await api.get(`/api/usuarios/${cedula_usuario}`);
  return response.data;
};

// Obtener todos los usuarios
const getUsuarios = async () => {
  const response = await api.get('/api/usuarios');
  return response.data;
};

// Actualizar un usuario por cédula
const updateUsuario = async (cedula_usuario, usuario) => {
  const response = await api.put(`/api/usuarios/${cedula_usuario}`, usuario);
  return response.data;
};

// Eliminar un usuario por cédula
const deleteUsuario = async (cedula_usuario) => {
  const response = await api.delete(`/api/usuarios/${cedula_usuario}`);
  return response.data;
};

// Actualizar estatus del usuario
const updateUsuarioEstatus = async (cedula_usuario, estatus) => {
  const response = await api.put(`/api/usuarios/${cedula_usuario}/estatus`, { estatus });
  return response.data;
};

// Verificar contraseña del usuario
const verifyPassword = async (cedula_usuario, password) => {
  const response = await api.post('/api/usuarios/verify-password', {
    cedula_usuario,
    password
  });
  return response.data;
};

// Actualizar contraseña del usuario
const updatePassword = async (cedula_usuario, clave) => {
  const response = await api.put(`/api/usuarios/${cedula_usuario}/password`, { clave });
  return response.data;
};

// Logout del usuario
const logoutUsuario = async () => {
  const response = await api.post('/api/usuarios/logout');
  return response.data;
};

// ============================================
// EXPORTAR TODOS LOS SERVICIOS
// ============================================

export default {
  // Instancia de axios (por si la necesitas directamente)
  api,
  
  // Servicios de usuario
  createUsuario,
  getUsuario,
  getUsuarios,
  updateUsuario,
  deleteUsuario,
  updateUsuarioEstatus,
  verifyPassword,
  updatePassword,
  logoutUsuario,
};