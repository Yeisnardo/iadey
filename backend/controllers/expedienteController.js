const ExpedienteModel = require('../models/expedienteModel');
const SolicitudModel = require('../models/solicitudModel');
const PersonaModel = require('../models/personaModel');
const UsuarioModel = require('../models/usuarioModel');

const expedienteController = {
  // Obtener todos los expedientes
  async getAll(req, res) {
    try {
      const expedientes = await ExpedienteModel.getAll();
      res.json({ success: true, data: expedientes });
    } catch (error) {
      console.error('Error en getAll:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Obtener expediente por ID
  async getById(req, res) {
    try {
      const expediente = await ExpedienteModel.getById(req.params.id);
      if (!expediente) {
        return res.status(404).json({ success: false, error: 'Expediente no encontrado' });
      }
      res.json({ success: true, data: expediente });
    } catch (error) {
      console.error('Error en getById:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Obtener expediente por código
  async getByCodigo(req, res) {
    try {
      const expediente = await ExpedienteModel.getByCodigo(req.params.codigo);
      if (!expediente) {
        return res.status(404).json({ success: false, error: 'Expediente no encontrado' });
      }
      res.json({ success: true, data: expediente });
    } catch (error) {
      console.error('Error en getByCodigo:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Crear expediente
  async create(req, res) {
    try {
      const {
        cedula_persona,
        solicitud,
        monto_solicitado,
        id_usuario,
        requisitos_capturados,
        verificacion_requisitos,
        imagenes_capturadas
      } = req.body;

      // Validar datos requeridos
      if (!cedula_persona) {
        return res.status(400).json({ 
          success: false, 
          error: 'La cédula de la persona es requerida' 
        });
      }

      if (!solicitud) {
        return res.status(400).json({ 
          success: false, 
          error: 'La descripción de la solicitud es requerida' 
        });
      }

      // 1. Verificar si existe la persona
      let persona = await PersonaModel.getByCedula(cedula_persona);
      if (!persona) {
        return res.status(404).json({ 
          success: false, 
          error: 'Persona no encontrada. Debe registrar primero al emprendedor.' 
        });
      }

      // 2. Verificar si existe el usuario (inspector)
      if (id_usuario) {
        const usuario = await UsuarioModel.getById(id_usuario);
        if (!usuario) {
          return res.status(404).json({ 
            success: false, 
            error: 'Inspector no encontrado' 
          });
        }
      }

      // 3. Crear la solicitud
      const nuevaSolicitud = await SolicitudModel.create({
        cedula_persona,
        solicitud,
        monto_solicitado: monto_solicitado || 0,
        estatus: 'En revisión'
      });

      // 4. Generar código de expediente
      const año = new Date().getFullYear();
      const ultimoNumero = await ExpedienteModel.getLastExpedienteNumber(año);
      const nuevoNumero = ultimoNumero + 1;
      const codigo_expediente = `EXP-${año}-${String(nuevoNumero).padStart(4, '0')}`;

      // 5. Preparar datos de requisitos
      const requisitosIds = requisitos_capturados ? Object.keys(requisitos_capturados) : [];
      
      // 6. Crear el expediente
      const nuevoExpediente = await ExpedienteModel.create({
        id_solicitud: nuevaSolicitud.id_solicitud,
        id_usuario: id_usuario || null,
        id_requisitos: JSON.stringify(requisitosIds),
        verificacion_requisitos: JSON.stringify({
          documentos_capturados: requisitos_capturados || {},
          imagenes: imagenes_capturadas || {},
          verificacion: verificacion_requisitos || {},
          fecha_verificacion: new Date().toISOString()
        }),
        codigo_expediente,
        estatus: 'Activo'
      });

      res.status(201).json({
        success: true,
        message: 'Expediente creado exitosamente',
        data: {
          expediente: nuevoExpediente,
          solicitud: nuevaSolicitud,
          persona,
          codigo_expediente
        }
      });
    } catch (error) {
      console.error('Error en create:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        details: error.detail || 'Error al crear el expediente'
      });
    }
  },

  // Actualizar expediente
  async update(req, res) {
    try {
      const expedienteExistente = await ExpedienteModel.getById(req.params.id);
      if (!expedienteExistente) {
        return res.status(404).json({ success: false, error: 'Expediente no encontrado' });
      }

      const expediente = await ExpedienteModel.update(req.params.id, req.body);
      res.json({ success: true, data: expediente });
    } catch (error) {
      console.error('Error en update:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Actualizar estatus
  async updateStatus(req, res) {
    try {
      const { estatus } = req.body;
      const estatusValidos = ['Activo', 'En Proceso', 'Completado', 'Revisión', 'Documentación Pendiente', 'Programado', 'Aprobado', 'Rechazado'];
      
      if (!estatusValidos.includes(estatus)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Estatus no válido' 
        });
      }

      const expediente = await ExpedienteModel.updateStatus(req.params.id, estatus);
      if (!expediente) {
        return res.status(404).json({ success: false, error: 'Expediente no encontrado' });
      }
      
      res.json({ success: true, data: expediente });
    } catch (error) {
      console.error('Error en updateStatus:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Obtener expedientes por usuario
  async getByUsuario(req, res) {
    try {
      const expedientes = await ExpedienteModel.getByUsuario(req.params.id_usuario);
      res.json({ success: true, data: expedientes });
    } catch (error) {
      console.error('Error en getByUsuario:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Obtener expedientes por estatus
  async getByEstatus(req, res) {
    try {
      const expedientes = await ExpedienteModel.getByEstatus(req.params.estatus);
      res.json({ success: true, data: expedientes });
    } catch (error) {
      console.error('Error en getByEstatus:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Eliminar expediente
  async delete(req, res) {
    try {
      const expediente = await ExpedienteModel.delete(req.params.id);
      if (!expediente) {
        return res.status(404).json({ success: false, error: 'Expediente no encontrado' });
      }
      res.json({ success: true, message: 'Expediente eliminado correctamente' });
    } catch (error) {
      console.error('Error en delete:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Obtener estadísticas de expedientes
  async getStats(req, res) {
    try {
      const expedientes = await ExpedienteModel.getAll();
      
      const stats = {
        total: expedientes.length,
        activos: expedientes.filter(e => e.estatus === 'Activo').length,
        enProceso: expedientes.filter(e => e.estatus === 'En Proceso').length,
        completados: expedientes.filter(e => e.estatus === 'Completado').length,
        revision: expedientes.filter(e => e.estatus === 'Revisión').length
      };
      
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error en getStats:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = expedienteController;