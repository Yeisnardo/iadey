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
      console.log('=== API: REGISTRANDO PAGO ===');
      console.log('ID Cuota:', id_cuota);
      console.log('Datos:', datosPago);
      
      const response = await api.post(`/cuota/cuota/${id_cuota}/pagar`, datosPago);
      
      console.log('Respuesta del servidor:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error en registrarPago:', error);
      throw error.response?.data || { error: 'Error al registrar el pago' };
    }
  },

  // Generar cuotas manualmente
  generarCuotasManual: async (id_contrato, configuracion) => {
    try {
      console.log('=== API: GENERANDO CUOTAS ===');
      console.log('ID Contrato:', id_contrato);
      console.log('Configuración:', configuracion);
      
      const response = await api.post(`/cuota/contrato/${id_contrato}/generar-cuotas-manual`, configuracion);
      
      console.log('Respuesta del servidor:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error en generarCuotasManual:', error);
      throw error.response?.data || { error: 'Error al generar las cuotas' };
    }
  },

  // Actualizar estados de mora
  actualizarMora: async () => {
    try {
      const response = await api.post('/cuota/actualizar-mora');
      return response.data;
    } catch (error) {
      console.error('Error en actualizarMora:', error);
      throw error.response?.data || { error: 'Error al actualizar mora' };
    }
  },

  // Test de recálculo de gracias
  testRecalculo: async (id_contrato) => {
    try {
      const response = await api.post(`/cuota/test-recalculo/${id_contrato}`);
      return response.data;
    } catch (error) {
      console.error('Error en testRecalculo:', error);
      throw error.response?.data || { error: 'Error en test de recálculo' };
    }
  }
};

export default CuotaAPI;