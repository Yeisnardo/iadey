const Usuario = require('../models/Usuario');
const Persona = require('../models/Persona');
const jwt = require('jsonwebtoken');

const usuariosController = {
  async createUsuario(req, res) {
    try {
      const { cedula_usuario, clave, estatus } = req.body;
      
      // Verificar si la persona existe
      const persona = await Persona.findByCedula(cedula_usuario);
      if (!persona) {
        return res.status(404).json({ 
          error: 'No existe una persona con esta cédula',
          sugerencia: 'Primero registre los datos personales'
        });
      }
      
      // Verificar si ya existe el usuario
      const existe = await Usuario.findByCedula(cedula_usuario);
      if (existe) {
        return res.status(400).json({ error: 'Ya existe un usuario con esta cédula' });
      }
      
      // Crear usuario
      const usuario = await Usuario.create({ cedula_usuario, clave, estatus });
      
      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: usuario
      });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  },
  
  async getUsuarios(req, res) {
    try {
      const { page = 1, limit = 10, estatus } = req.query;
      const result = await Usuario.findAll({ 
        page: parseInt(page), 
        limit: parseInt(limit),
        estatus: estatus !== undefined ? estatus === 'true' : null
      });
      
      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  },
  
  async getUsuario(req, res) {
    try {
      const { cedula_usuario } = req.params;
      const usuario = await Usuario.findByCedula(cedula_usuario);
      
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      delete usuario.clave; // No enviar la contraseña
      
      res.status(200).json({
        success: true,
        data: usuario
      });
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  },
  
  async updateUsuario(req, res) {
    try {
      const { cedula_usuario } = req.params;
      const updates = req.body;
      
      const usuario = await Usuario.update(cedula_usuario, updates);
      
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      res.status(200).json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: usuario
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  },
  
  async deleteUsuario(req, res) {
    try {
      const { cedula_usuario } = req.params;
      const usuario = await Usuario.delete(cedula_usuario);
      
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      res.status(200).json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  },
  
  async updateUsuarioEstatus(req, res) {
    try {
      const { cedula_usuario } = req.params;
      const { estatus } = req.body;
      
      if (typeof estatus !== 'boolean') {
        return res.status(400).json({ error: 'El estatus debe ser un valor booleano' });
      }
      
      const usuario = await Usuario.updateEstatus(cedula_usuario, estatus);
      
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      res.status(200).json({
        success: true,
        message: `Usuario ${estatus ? 'activado' : 'desactivado'} exitosamente`,
        data: usuario
      });
    } catch (error) {
      console.error('Error al actualizar estatus:', error);
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  },
  
  async verifyPassword(req, res) {
    try {
      const { cedula_usuario, password } = req.body;
      
      if (!cedula_usuario || !password) {
        return res.status(400).json({ error: 'Se requiere cédula y contraseña' });
      }
      
      const result = await Usuario.verifyPassword(cedula_usuario, password);
      
      if (result.valid) {
        // Generar token JWT
        const token = jwt.sign(
          { cedula: cedula_usuario },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRE }
        );
        
        res.status(200).json({
          success: true,
          valid: true,
          token,
          message: 'Autenticación exitosa'
        });
      } else {
        res.status(401).json({
          valid: false,
          error: result.error,
          intentos_restantes: result.intentos_restantes
        });
      }
    } catch (error) {
      console.error('Error al verificar contraseña:', error);
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  },
  
  async updatePassword(req, res) {
    try {
      const { cedula_usuario } = req.params;
      const { clave } = req.body;
      
      if (!clave || clave.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }
      
      const usuario = await Usuario.updatePassword(cedula_usuario, clave);
      
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      res.status(200).json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  },
  
  async logoutUsuario(req, res) {
    try {
      res.status(200).json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });
    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
  }
};

module.exports = usuariosController;