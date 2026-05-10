// services/api_aprobacion.js
import api from './api_principal';

const aprobacionAPI = {
  getAll: async () => {
    try {
      const response = await api.get('/aprobacion');
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error en getAll aprobaciones:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al obtener las aprobaciones' 
      };
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/aprobacion/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error en getById aprobacion:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al obtener la aprobación' 
      };
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/aprobacion/stats');
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error en getStats aprobaciones:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al obtener estadísticas' 
      };
    }
  },

  verificarRequisitos: async (idExpediente, datosVerificacion) => {
    try {
      const response = await api.post('/aprobacion/verificar-requisitos', {
        id_expediente: idExpediente,
        requisitos: datosVerificacion.requisitos,
        observaciones: datosVerificacion.observaciones,
        seleccion_manejo: datosVerificacion.seleccion_manejo || null
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error en verificarRequisitos:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al verificar requisitos' 
      };
    }
  },

  // Nueva función para actualizar selección de manejo
  verificarRequisitos: async (idExpediente, datosVerificacion) => {
    try {
      const response = await api.post('/aprobacion/verificar-requisitos', {
        id_expediente: idExpediente,
        requisitos: datosVerificacion.requisitos,
        observaciones: datosVerificacion.observaciones,
        seleccion_manejo: datosVerificacion.seleccion_manejo // Nuevo campo
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error en verificarRequisitos:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Error al verificar requisitos' 
      };
    }
  }
};

export default aprobacionAPI;