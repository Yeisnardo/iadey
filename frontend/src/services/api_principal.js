import axios from 'axios';

// Configuración que funciona en LOCAL y en VERCEl
const getBaseURL = () => {
  // Desarrollo local
  if (import.meta.env.DEV) {
    return 'http://localhost:3000/api';
  }
  
  // Producción (Vercel)
  if (import.meta.env.PROD) {
    // Primero intenta usar la variable de entorno
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    // Fallback a la URL de Render
    return 'https://iadey-1.onrender.com/api';
  }
  
  return 'http://localhost:3000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;