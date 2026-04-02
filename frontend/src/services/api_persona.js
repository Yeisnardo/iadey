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
// SERVICIOS DE PERSONA
// ============================================

// Crear una nueva persona (versión completa)
const createPersona = async (persona) => {
  const response = await api.post('/api/persona', persona);
  return response.data;
};

// Crear persona con campos básicos
const createPersonaBasica = async (persona) => {
  const response = await api.post('/api/persona/basica', persona);
  return response.data;
};

// Obtener una persona por cédula
const getPersona = async (cedula) => {
  const response = await api.get(`/api/persona/${cedula}`);
  return response.data;
};

// Obtener todas las personas
const getPersonas = async () => {
  const response = await api.get('/api/persona');
  return response.data;
};

// Actualizar una persona por cédula
const updatePersona = async (cedula, persona) => {
  const response = await api.put(`/api/persona/${cedula}`, persona);
  return response.data;
};

// Eliminar una persona por cédula
const deletePersona = async (cedula) => {
  const response = await api.delete(`/api/persona/${cedula}`);
  return response.data;
};

// ============================================
// EXPORTAR TODOS LOS SERVICIOS
// ============================================

export default {
  // Instancia de axios (por si la necesitas directamente)
  api,
  
  // Servicios de persona
  createPersona,
  createPersonaBasica,
  getPersona,
  getPersonas,
  updatePersona,
  deletePersona,
};