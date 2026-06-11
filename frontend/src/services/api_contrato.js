import api from './api_principal';

const ContratoAPI = {
  // Obtener todas las aprobaciones con manejo interno
  getAll: async () => {
    try {
      const response = await api.get('/contrato');
      return response.data;
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error.response?.data || { error: 'Error al obtener los contratos' };
    }
  },

  // Registrar un nuevo contrato
  create: async (contratoData) => {
    try {
      const response = await api.post('/contrato', contratoData);
      return response.data;
    } catch (error) {
      console.error('Error en create:', error);
      throw error.response?.data || { error: 'Error al registrar el contrato' };
    }
  },

  // Obtener el último número de contrato
  getLastContractNumber: async () => {
    try {
      const response = await api.get('/contrato/last-number');
      return response.data;
    } catch (error) {
      console.error('Error en getLastContractNumber:', error);
      throw error.response?.data || { error: 'Error al obtener el último número de contrato' };
    }
  },

  // Obtener un contrato por ID de aprobación
  getById: async (id) => {
    try {
      const response = await api.get(`/contrato/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error en getById:', error);
      throw error.response?.data || { error: 'Error al obtener el contrato' };
    }
  },

  // Actualizar estatus del contrato
  updateStatus: async (id_aprob, estatus) => {
    try {
      const response = await api.put(`/contrato/${id_aprob}/estatus`, { estatus });
      return response.data;
    } catch (error) {
      console.error('Error en updateStatus:', error);
      throw error.response?.data || { error: 'Error al actualizar el estatus' };
    }
  },

  // Realizar desembolso
  realizarDesembolso: async (desembolsoData) => {
    try {
      // CORRECTED: Send to /contrato/desembolso (POST) as defined in your routes
      const response = await api.post('/contrato/desembolso', desembolsoData);
      return response.data;
    } catch (error) {
      console.error('Error en realizarDesembolso:', error);
      throw error.response?.data || { error: 'Error al realizar el desembolso' };
    }
  },

  // Confirmar pago de desembolso
  confirmarPago: async (id_desembolso, pagoData) => {
    try {
      const response = await api.put(`/contrato/desembolso/${id_desembolso}/confirmar-pago`, pagoData);
      return response.data;
    } catch (error) {
      console.error('Error en confirmarPago:', error);
      throw error.response?.data || { error: 'Error al confirmar el pago' };
    }
  },

  // Obtener desembolsos por contrato
  getDesembolsosByContrato: async (id_aprob) => {
    try {
      const response = await api.get(`/contrato/${id_aprob}/desembolsos`);
      return response.data;
    } catch (error) {
      console.error('Error en getDesembolsosByContrato:', error);
      throw error.response?.data || { error: 'Error al obtener los desembolsos' };
    }
  }
};

export default ContratoAPI;