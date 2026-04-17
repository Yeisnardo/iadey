import api from './api_principal';

const SolicitudAPI = {
  // Obtener todas las solicitudes
  getAll: async () => {
    try {
      const response = await api.get('/solicitud');
      return response.data;
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error.response?.data || { error: 'Error al obtener las solicitudes' };
    }
  },

  // Obtener solicitud por id_solicitud
  getById: async (id_solicitud) => {
    try {
      const response = await api.get(`/solicitud/${id_solicitud}`);
      return response.data;
    } catch (error) {
      console.error('Error en getById:', error);
      throw error.response?.data || { error: 'Error al obtener la solicitud' };
    }
  },

  // Obtener solicitud por cédula de persona
  getByCedula: async (cedula_persona) => {
    try {
      const response = await api.get(`/solicitud/cedula/${cedula_persona}`);
      return response.data;
    } catch (error) {
      console.error('Error en getByCedula:', error);
      throw error.response?.data || { error: 'Error al obtener la solicitud por cédula' };
    }
  },

  // Crear nueva solicitud
  create: async (solicitudData) => {
    try {
      const response = await api.post('/solicitud', solicitudData);
      return response.data;
    } catch (error) {
      console.error('Error en create:', error);
      throw error.response?.data || { error: 'Error al crear la solicitud' };
    }
  },

  // Actualizar solicitud por id_solicitud
  update: async (id_solicitud, solicitudData) => {
    try {
      const response = await api.put(`/solicitud/${id_solicitud}`, solicitudData);
      return response.data;
    } catch (error) {
      console.error('Error en update:', error);
      throw error.response?.data || { error: 'Error al actualizar la solicitud' };
    }
  },

  // Cambiar estatus de solicitud
  updateEstatus: async (id_solicitud, estatus, motivo_rechazo = null) => {
    try {
      const response = await api.put(`/solicitud/${id_solicitud}/estatus`, { estatus, motivo_rechazo });
      return response.data;
    } catch (error) {
      console.error('Error en updateEstatus:', error);
      throw error.response?.data || { error: 'Error al cambiar el estatus de la solicitud' };
    }
  },

  // Eliminar solicitud por id_solicitud
  delete: async (id_solicitud) => {
    try {
      const response = await api.delete(`/solicitud/${id_solicitud}`);
      return response.data;
    } catch (error) {
      console.error('Error en delete:', error);
      throw error.response?.data || { error: 'Error al eliminar la solicitud' };
    }
  },
};

export default SolicitudAPI;