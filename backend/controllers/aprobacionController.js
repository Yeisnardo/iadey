const AprobacionModel = require('../models/aprobacionModel');

const aprobacionController = {
  // Obtener todos los expedientes
  getAllExpedientes: async (req, res) => {
    try {
      const expedientes = await AprobacionModel.getAllExpedientes();
      console.log('Expedientes obtenidos:', expedientes.length);
      res.json({ 
        success: true, 
        data: expedientes,
        total: expedientes.length
      });
    } catch (error) {
      console.error('Error en getAllExpedientes:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error al obtener los expedientes: ' + error.message 
      });
    }
  },

  // Obtener expediente por ID
  getExpedienteById: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({ 
          success: false, 
          error: 'ID de expediente inválido' 
        });
      }
      
      const expediente = await AprobacionModel.getExpedienteById(parseInt(id));
      
      if (!expediente) {
        return res.status(404).json({ 
          success: false, 
          error: 'Expediente no encontrado' 
        });
      }
      
      res.json({ 
        success: true, 
        data: expediente 
      });
    } catch (error) {
      console.error('Error en getExpedienteById:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error al obtener el expediente: ' + error.message 
      });
    }
  },

  verificarRequisitos: async (req, res) => {
  try {
    const { 
      id_expediente, 
      requisitos, 
      observaciones, 
      seleccion_manejo,
      estatus_aprobacion,
      estatus_inspeccion,
      id_inspeccion
    } = req.body;
    
    console.log('📥 Datos recibidos en el controlador:', {
      id_expediente,
      requisitos_length: requisitos?.length,
      seleccion_manejo,
      estatus_aprobacion,
      estatus_inspeccion,  // ← Verificar que llega
      id_inspeccion
    });
    
    // Validaciones
    if (!id_expediente) {
      return res.status(400).json({
        success: false,
        error: 'El id_expediente es requerido'
      });
    }
    
    if (!requisitos || !Array.isArray(requisitos)) {
      return res.status(400).json({
        success: false,
        error: 'Los requisitos deben ser un arreglo'
      });
    }
    
    if (requisitos.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Debe proporcionar al menos un requisito'
      });
    }
    
    // Validar que cada requisito tenga la estructura correcta
    const requisitosValidos = requisitos.every(r => 
      r.id_requisito && 
      r.nombre && 
      typeof r.verificado === 'boolean'
    );
    
    if (!requisitosValidos) {
      return res.status(400).json({
        success: false,
        error: 'Estructura de requisitos inválida. Cada requisito debe tener id_requisito, nombre y verificado'
      });
    }
    
    // Determinar el estatus basado en los requisitos verificados
    const todosVerificados = requisitos.every(r => r.verificado === true);
    const algunosVerificados = requisitos.some(r => r.verificado === true);
    
    let estatus;
    if (todosVerificados) {
      estatus = 'Aprobado';
    } else if (algunosVerificados) {
      estatus = 'En Proceso';
    } else {
      estatus = 'Pendiente';
    }
    
    // Si todos están verificados, debe seleccionar manejo
    if (todosVerificados && !seleccion_manejo) {
      return res.status(400).json({
        success: false,
        error: 'Debe seleccionar el tipo de manejo (Interno o Banco) cuando todos los requisitos están verificados'
      });
    }
    
    // Validar seleccion_manejo si se proporciona
    if (seleccion_manejo && !['Interno', 'Banco'].includes(seleccion_manejo)) {
      return res.status(400).json({
        success: false,
        error: 'El tipo de manejo debe ser "Interno" o "Banco"'
      });
    }
    
    // Guardar la verificación
    const resultado = await AprobacionModel.verificarRequisitos({
      id_expediente,
      requisitos,
      estatus,
      seleccion_manejo: todosVerificados ? seleccion_manejo : null,
      observaciones: observaciones || '',
      id_inspeccion: id_inspeccion || null,
      estatus_aprobacion: estatus_aprobacion || estatus,
      estatus_inspeccion: estatus_inspeccion || null  // ← PASAR AL MODELO
    });
    
    res.json({
      success: true,
      data: resultado,
      message: `Verificación guardada exitosamente. Estatus: ${estatus}`
    });
  } catch (error) {
    console.error('Error en verificarRequisitos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al verificar requisitos: ' + error.message
    });
  }
},

  // Estadísticas de expedientes
  getStatsExpedientes: async (req, res) => {
    try {
      const stats = await AprobacionModel.getStatsExpedientes();
      res.json({ 
        success: true, 
        data: stats 
      });
    } catch (error) {
      console.error('Error en getStatsExpedientes:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error al obtener estadísticas: ' + error.message 
      });
    }
  }
};

module.exports = aprobacionController;