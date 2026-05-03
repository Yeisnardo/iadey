// frontend/src/api/inspeccionAPI.js
import api from './api_principal';

const inspeccionAPI = {

  getFullData: async (id) => {
  try {
    const response = await api.get(`/inspeccion/${id}/full`);
    return response.data;
  } catch (error) {
    console.error('Error en getFullData:', error);
    throw error.response?.data || { error: 'Error al obtener datos completos' };
  }
},


  // Obtener todas las inspecciones
  getAll: async () => {
    try {
      const response = await api.get('/inspeccion');
      return response.data;
    } catch (error) {
      console.error('Error en getAll inspecciones:', error);
      throw error.response?.data || { error: 'Error al obtener inspecciones' };
    }
  },

  // Obtener una inspección por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/inspeccion/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en getById inspección:', error);
      throw error.response?.data || { error: 'Error al obtener inspección' };
    }
  },

  // Obtener inspecciones por expediente
  getByExpediente: async (idExpediente) => {
    try {
      const response = await api.get(`/inspeccion/expediente/${idExpediente}`);
      return response.data;
    } catch (error) {
      console.error('Error en getByExpediente:', error);
      throw error.response?.data || { error: 'Error al obtener inspecciones del expediente' };
    }
  },

  // Obtener datos del emprendimiento para inspección
  getEmprendimientoData: async (idExpediente) => {
    try {
      const response = await api.get(`/inspeccion/emprendimiento/${idExpediente}`);
      return response.data;
    } catch (error) {
      console.error('Error en getEmprendimientoData:', error);
      throw error.response?.data || { error: 'Error al obtener datos del emprendimiento' };
    }
  },

  // Crear nueva inspección
  create: async (data) => {
    try {
      const response = await api.post('/inspeccion', data);
      return response.data;
    } catch (error) {
      console.error('Error en create inspección:', error);
      throw error.response?.data || { error: 'Error al crear inspección' };
    }
  },

  // Actualizar inspección
  update: async (id, data) => {
    try {
      const response = await api.put(`/inspeccion/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error en update inspección:', error);
      throw error.response?.data || { error: 'Error al actualizar inspección' };
    }
  },

  // Guardar resultados de inspección
  saveResults: async (id, results) => {
    try {
      const response = await api.post(`/inspeccion/${id}/resultados`, { results });
      return response.data;
    } catch (error) {
      console.error('Error en saveResults:', error);
      throw error.response?.data || { error: 'Error al guardar resultados' };
    }
  },

  // Guardar inspección completa (nueva)
  saveFullInspection: async (data) => {
    try {
      const response = await api.post('/inspeccion/full', data);
      return response.data;
    } catch (error) {
      console.error('Error en saveFullInspection:', error);
      throw error.response?.data || { error: 'Error al guardar inspección completa' };
    }
  },

  // Actualizar inspección completa
  updateFullInspection: async (id, data) => {
    try {
      const response = await api.put(`/inspeccion/${id}/full`, data);
      return response.data;
    } catch (error) {
      console.error('Error en updateFullInspection:', error);
      throw error.response?.data || { error: 'Error al actualizar inspección completa' };
    }
  }
};

export default inspeccionAPI;