const Persona = require('../models/Persona');

const personaController = {
  async createPersona(req, res) {
    try {
      const personaData = req.body;
      
      // Verificar si ya existe
      const existe = await Persona.findByCedula(personaData.cedula);
      if (existe) {
        return res.status(400).json({ error: 'Ya existe una persona con esta cédula' });
      }
      
      // Verificar email único
      const emailExiste = await Persona.findByEmail(personaData.email);
      if (emailExiste) {
        return res.status(400).json({ error: 'Ya existe una persona con este email' });
      }
      
      const persona = await Persona.create(personaData);
      
      res.status(201).json({
        success: true,
        message: 'Persona creada exitosamente',
        data: persona
      });
    } catch (error) {
      console.error('Error al crear persona:', error);
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  },
  
  async createPersonaBasica(req, res) {
    try {
      const { cedula, primer_nombre, primer_apellido, email } = req.body;
      
      // Validar campos obligatorios
      if (!cedula || !primer_nombre || !primer_apellido || !email) {
        return res.status(400).json({ 
          error: 'Faltan campos obligatorios',
          requeridos: ['cedula', 'primer_nombre', 'primer_apellido', 'email']
        });
      }
      
      // Verificar si ya existe
      const existe = await Persona.findByCedula(cedula);
      if (existe) {
        return res.status(400).json({ error: 'Ya existe una persona con esta cédula' });
      }
      
      const persona = await Persona.createBasica({ cedula, primer_nombre, primer_apellido, email });
      
      res.status(201).json({
        success: true,
        message: 'Persona creada exitosamente',
        data: persona
      });
    } catch (error) {
      console.error('Error al crear persona básica:', error);
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  },
  
  async getPersona(req, res) {
    try {
      const { cedula } = req.params;
      const persona = await Persona.findByCedula(cedula);
      
      if (!persona) {
        return res.status(404).json({ error: 'Persona no encontrada' });
      }
      
      res.status(200).json({
        success: true,
        data: persona
      });
    } catch (error) {
      console.error('Error al obtener persona:', error);
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  },
  
  async getPersonas(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const result = await Persona.findAll({ 
        page: parseInt(page), 
        limit: parseInt(limit),
        search
      });
      
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error al obtener personas:', error);
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  },
  
  async updatePersona(req, res) {
    try {
      const { cedula } = req.params;
      const updates = req.body;
      
      const persona = await Persona.update(cedula, updates);
      
      if (!persona) {
        return res.status(404).json({ error: 'Persona no encontrada' });
      }
      
      res.status(200).json({
        success: true,
        message: 'Persona actualizada exitosamente',
        data: persona
      });
    } catch (error) {
      console.error('Error al actualizar persona:', error);
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  },
  
  async deletePersona(req, res) {
    try {
      const { cedula } = req.params;
      
      const persona = await Persona.delete(cedula);
      
      if (!persona) {
        return res.status(404).json({ error: 'Persona no encontrada' });
      }
      
      res.status(200).json({
        success: true,
        message: 'Persona eliminada exitosamente'
      });
    } catch (error) {
      if (error.message.includes('tiene un usuario asociado')) {
        return res.status(400).json({ error: error.message });
      }
      console.error('Error al eliminar persona:', error);
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  }
};

module.exports = personaController;