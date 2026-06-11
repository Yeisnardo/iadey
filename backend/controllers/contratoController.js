const ContratoModel = require('../models/contratoModel');

const contratoController = {
  // Obtener todas las aprobaciones con manejo interno
  async getAll(req, res) {
    try {
      const contratos = await ContratoModel.getAll();
      res.json({ success: true, data: contratos });
    } catch (error) {
      console.error('Error en getAll:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Registrar un nuevo contrato
  async create(req, res) {
    try {
      const contratoData = req.body;
      
      // Validar campos requeridos
      const requiredFields = [
        'id_aprob', 'id_config', 'numero_contrato', 'moneda', 
        'monto_moneda', 'cambio', 'flat', 'interes', 
        'devolvimiento', 'numero_cuotas', 'inicio', 'cierre'
      ];
      
      const missingFields = requiredFields.filter(field => !contratoData[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Campos requeridos faltantes: ${missingFields.join(', ')}`
        });
      }

      // Establecer estatus inicial como "Pendiente"
      contratoData.estatus = 'Pendiente por aceptar';

      const nuevoContrato = await ContratoModel.create(contratoData);
      
      res.status(201).json({
        success: true,
        message: 'Contrato registrado exitosamente',
        data: nuevoContrato
      });
    } catch (error) {
      console.error('Error en create:', error);
      
      if (error.code === '23505') {
        res.status(400).json({
          success: false,
          error: 'El número de contrato ya existe'
        });
      } else if (error.code === '23503') {
        res.status(400).json({
          success: false,
          error: 'La aprobación o configuración no existe'
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message || 'Error al registrar el contrato'
        });
      }
    }
  },

  // Obtener el último número de contrato
  async getLastContractNumber(req, res) {
    try {
      const lastContract = await ContratoModel.getLastContractNumber();
      res.json({ success: true, data: lastContract });
    } catch (error) {
      console.error('Error en getLastContractNumber:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Obtener un contrato por ID de aprobación
  async getById(req, res) {
    try {
      const { id } = req.params;
      const contrato = await ContratoModel.getById(id);
      
      if (!contrato) {
        return res.status(404).json({
          success: false,
          error: 'Contrato no encontrado'
        });
      }
      
      res.json({ success: true, data: contrato });
    } catch (error) {
      console.error('Error en getById:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

// Actualizar estatus del contrato
async updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { estatus } = req.body;

    if (!estatus) {
      return res.status(400).json({
        success: false,
        error: 'El estatus es requerido'
      });
    }

    const allowedStatuses = [
      'Activo', 
      'Pendiente por aceptar',
      'Pendiente por desembolso',
      'Esperando aceptar desembolso',  // NUEVO ESTADO
      'Esperando contrato', 
      'Cancelado', 
      'Finalizado'
    ];
    
    if (!allowedStatuses.includes(estatus)) {
      return res.status(400).json({
        success: false,
        error: `Estatus no válido. Estatus permitidos: ${allowedStatuses.join(', ')}`
      });
    }

    const contratoExistente = await ContratoModel.getById(id);
    if (!contratoExistente) {
      return res.status(404).json({
        success: false,
        error: 'Contrato no encontrado'
      });
    }

    const currentStatus = contratoExistente.estatus;
    
    // Definir transiciones válidas con el nuevo estado
    const validTransitions = {
      'Esperando contrato': ['Pendiente por aceptar', 'Cancelado'],
      'Pendiente por aceptar': ['Pendiente por desembolso', 'Cancelado'],
      'Pendiente por desembolso': ['Esperando aceptar desembolso', 'Cancelado'],  // Cambia a Esperando aceptar desembolso
      'Esperando aceptar desembolso': ['Activo', 'Cancelado'],  // Desde aquí puede ir a Activo o Cancelado
      'Activo': ['Finalizado', 'Cancelado'],
      'Finalizado': ['Cancelado'],
      'Cancelado': []
    };

    // Validar transición
    if (validTransitions[currentStatus] && 
        !validTransitions[currentStatus].includes(estatus)) {
      return res.status(400).json({
        success: false,
        error: `No se puede cambiar de "${currentStatus}" a "${estatus}". Transiciones válidas: ${validTransitions[currentStatus].join(', ') || 'ninguna'}`
      });
    }

    const contratoActualizado = await ContratoModel.updateStatus(id, estatus);

    res.json({
      success: true,
      message: `Estatus actualizado a "${estatus}" exitosamente`,
      data: contratoActualizado
    });
  } catch (error) {
    console.error('Error en updateStatus:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al actualizar el estatus del contrato'
    });
  }
},

  // Realizar desembolso
  async realizarDesembolso(req, res) {
    try {
      const desembolsoData = req.body;
      
      // Validar campos requeridos
      if (!desembolsoData.id_cont) {
        return res.status(400).json({
          success: false,
          error: 'El ID del contrato es requerido'
        });
      }
      
      if (!desembolsoData.capture_desembolso) {
        return res.status(400).json({
          success: false,
          error: 'La captura del comprobante es requerida'
        });
      }
      
      if (!desembolsoData.fecha_desembolso) {
        return res.status(400).json({
          success: false,
          error: 'La fecha de desembolso es requerida'
        });
      }
      
      // Obtener el contrato
      const contrato = await ContratoModel.getById(desembolsoData.id_cont);
      
      if (!contrato) {
        return res.status(404).json({
          success: false,
          error: `No se encontró un contrato para la aprobación #${desembolsoData.id_cont}`
        });
      }
      
      // Verificar estado del contrato
      if (contrato.estatus !== 'Pendiente por desembolso') {
        return res.status(400).json({
          success: false,
          error: `El contrato debe estar en estado "Pendiente por desembolso". Estado actual: ${contrato.estatus}`
        });
      }
      
      // Crear el desembolso
      const desembolso = await ContratoModel.crearDesembolso({
        id_cont: contrato.id_contrato,
        capture_desembolso: desembolsoData.capture_desembolso,
        fecha_desembolso: desembolsoData.fecha_desembolso,
        estatus_desembolso: desembolsoData.estatus_desembolso || 'pendiente por confirmar'
      });
      
      res.json({
        success: true,
        message: 'Desembolso registrado exitosamente',
        data: desembolso
      });
      
    } catch (error) {
      console.error('Error en realizarDesembolso:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al realizar el desembolso'
      });
    }
  },

  // Confirmar pago de desembolso
  async confirmarPago(req, res) {
    try {
      const { id } = req.params;
      const { fecha_confirmacion, observaciones_pago, referencia_pago } = req.body;

      if (!fecha_confirmacion) {
        return res.status(400).json({
          success: false,
          error: 'La fecha de confirmación es requerida'
        });
      }

      // Verificar que el desembolso existe
      const desembolsoExistente = await ContratoModel.getDesembolsoById(id);
      if (!desembolsoExistente) {
        return res.status(404).json({
          success: false,
          error: 'Desembolso no encontrado'
        });
      }

      // Verificar que el desembolso está en estado "Pendiente"
      if (desembolsoExistente.estatus_desembolso !== 'pendiente por confirmar') {
        return res.status(400).json({
          success: false,
          error: `El desembolso debe estar en estado "pendiente por confirmar" para confirmar el pago. Estado actual: ${desembolsoExistente.estatus_desembolso}`
        });
      }

      const pagoData = {
        fecha_confirmacion,
        observaciones_pago: observaciones_pago || null,
        referencia_pago: referencia_pago || null,
        estatus_desembolso: 'confirmado'
      };

      const desembolsoActualizado = await ContratoModel.confirmarPagoDesembolso(id, pagoData);

      res.json({
        success: true,
        message: 'Pago confirmado exitosamente',
        data: desembolsoActualizado
      });
    } catch (error) {
      console.error('Error en confirmarPago:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al confirmar el pago'
      });
    }
  },

  // Obtener desembolsos por contrato
  async getDesembolsosByContrato(req, res) {
    try {
      const { id } = req.params;
      const desembolsos = await ContratoModel.getDesembolsosByContrato(id);
      
      res.json({
        success: true,
        data: desembolsos
      });
    } catch (error) {
      console.error('Error en getDesembolsosByContrato:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Error al obtener los desembolsos'
      });
    }
  }
};

module.exports = contratoController;