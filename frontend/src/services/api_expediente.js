import api from './api_principal';

const expedienteAPI = {
  // Obtener todos los expedientes
  getAllExpedientes: async () => {
    try {
      const response = await api.get('/expediente');
      return response.data;
    } catch (error) {
      console.error('Error en getAllExpedientes:', error);
      throw error.response?.data || { error: 'Error al obtener los expedientes' };
    }
  },

  // Obtener expediente por ID
  getExpedienteById: async (id) => {
    try {
      const response = await api.get(`/expediente/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en getExpedienteById:', error);
      throw error.response?.data || { error: 'Error al obtener el expediente' };
    }
  },

  // Obtener expediente por código
  getExpedienteByCodigo: async (codigo) => {
    try {
      const response = await api.get(`/expediente/codigo/${codigo}`);
      return response.data;
    } catch (error) {
      console.error('Error en getExpedienteByCodigo:', error);
      throw error.response?.data || { error: 'Error al obtener el expediente' };
    }
  },

  // Obtener expedientes por usuario (inspector)
  getExpedientesByUsuario: async (id_usuario) => {
    try {
      const response = await api.get(`/expediente/usuario/${id_usuario}`);
      return response.data;
    } catch (error) {
      console.error('Error en getExpedientesByUsuario:', error);
      throw error.response?.data || { error: 'Error al obtener expedientes del usuario' };
    }
  },

  // Obtener expedientes por estatus
  getExpedientesByEstatus: async (estatus) => {
    try {
      const response = await api.get(`/expediente/estatus/${estatus}`);
      return response.data;
    } catch (error) {
      console.error('Error en getExpedientesByEstatus:', error);
      throw error.response?.data || { error: 'Error al obtener expedientes por estatus' };
    }
  },

  // Crear nuevo expediente
  createExpediente: async (expedienteData) => {
    try {
      const response = await api.post('/expediente', expedienteData);
      return response.data;
    } catch (error) {
      console.error('Error en createExpediente:', error);
      throw error.response?.data || { error: 'Error al crear el expediente' };
    }
  },

  // Actualizar expediente
  updateExpediente: async (id, expedienteData) => {
    try {
      const response = await api.put(`/expediente/${id}`, expedienteData);
      return response.data;
    } catch (error) {
      console.error('Error en updateExpediente:', error);
      throw error.response?.data || { error: 'Error al actualizar el expediente' };
    }
  },

  // Actualizar estatus
  updateExpedienteStatus: async (id, estatus) => {
    try {
      const response = await api.patch(`/expediente/${id}/estatus`, { estatus });
      return response.data;
    } catch (error) {
      console.error('Error en updateExpedienteStatus:', error);
      throw error.response?.data || { error: 'Error al actualizar el estatus' };
    }
  },

  // Eliminar expediente
  deleteExpediente: async (id) => {
    try {
      const response = await api.delete(`/expediente/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en deleteExpediente:', error);
      throw error.response?.data || { error: 'Error al eliminar el expediente' };
    }
  },

  // Obtener estadísticas
  getExpedienteStats: async () => {
    try {
      const response = await api.get('/expediente/stats');
      return response.data;
    } catch (error) {
      console.error('Error en getExpedienteStats:', error);
      throw error.response?.data || { error: 'Error al obtener estadísticas' };
    }
  }
};

export default expedienteAPI;