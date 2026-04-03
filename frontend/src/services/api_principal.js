import axios from 'axios';

// ========== CONFIGURACIÓN PARA LOCAL Y RENDER ==========
// Detecta automáticamente el entorno y usa la URL correcta

const getBaseURL = () => {
  // Si estamos en desarrollo (localhost)
  if (import.meta.env.DEV) {
    return 'http://localhost:3000/api';
  }
  
  // Si estamos en producción (Render)
  if (import.meta.env.PROD) {
    // Usar variable de entorno o URL fija de Render
    return import.meta.env.VITE_API_URL || 'https://iadey-1.onrender.com/api';
  }
  
  // Fallback
  return 'http://localhost:3000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 segundos
});

// ========== INTERCEPTOR PARA AGREGAR TOKEN ==========
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log para debug (opcional)
    if (import.meta.env.DEV) {
      console.log(`📡 ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ========== INTERCEPTOR PARA MANEJAR ERRORES ==========
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Error 401 = No autorizado
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Error 503 = Servicio no disponible
    if (error.response?.status === 503) {
      console.error('Servidor no disponible (503). El backend en Render puede estar inactivo.');
    }
    
    return Promise.reject(error);
  }
);

export default api;