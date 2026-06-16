import api from './api_principal';

const CuotaAPI = {
  // Obtener todos los contratos con sus cuotas
  getAll: async () => {
    try {
      const response = await api.get('/cuota');
      return response.data;
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error.response?.data || { error: 'Error al obtener los datos' };
    }
  },

  // Obtener cuotas de un contrato específico
  getCuotasByContrato: async (id_contrato) => {
    try {
      const response = await api.get(`/cuota/contrato/${id_contrato}/cuotas`);
      return response.data;
    } catch (error) {
      console.error('Error en getCuotasByContrato:', error);
      throw error.response?.data || { error: 'Error al obtener las cuotas' };
    }
  },

  // Registrar pago de cuota
  registrarPago: async (id_cuota, datosPago) => {
    try {
      const response = await api.post(`/cuota/cuota/${id_cuota}/pagar`, datosPago);
      return response.data;
    } catch (error) {
      console.error('Error en registrarPago:', error);
      throw error.response?.data || { error: 'Error al registrar el pago' };
    }
  },

  generarCuotasManual: async (id_contrato, configuracion) => {
    try {
      const response = await api.post(`/cuota/contrato/${id_contrato}/generar-cuotas-manual`, configuracion);
      return response.data;
    } catch (error) {
      console.error('Error en generarCuotasManual:', error);
      throw error.response?.data || { error: 'Error al generar las cuotas' };
    }
  }
};

export default CuotaAPI;