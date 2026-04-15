const UsuarioModel = require('../models/usuarioModel');
const bcrypt = require('bcrypt');

const usuarioController = {
  // Obtener todos los usuarios
  async getAll(req, res) {
    try {
      const usuarios = await UsuarioModel.getAll();
      // Ocultar claves
      const usuariosSinClave = usuarios.map(u => {
        const { clave, ...resto } = u;
        return resto;
      });
      res.json({ success: true, data: usuariosSinClave });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Obtener usuario por ID
  async getById(req, res) {
    try {
      const usuario = await UsuarioModel.getById(req.params.id);
      if (!usuario) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }
      const { clave, ...usuarioSinClave } = usuario;
      res.json({ success: true, data: usuarioSinClave });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Obtener usuario por cédula (reemplaza a getByEmail)
  async getByCedula(req, res) {
    try {
      const usuario = await UsuarioModel.getByCedula(req.params.cedula_usuario);
      if (!usuario) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }
      const { clave, ...usuarioSinClave } = usuario;
      res.json({ success: true, data: usuarioSinClave });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Crear usuario (sin email)
  async create(req, res) {
    try {
      const { cedula_usuario, clave, rol, estatus } = req.body;

      // Verificar si ya existe la cédula
      const existeCedula = await UsuarioModel.getByCedula(cedula_usuario);
      if (existeCedula) {
        return res.status(400).json({ success: false, error: 'Ya existe un usuario con esta cédula' });
      }

      // Hashear contraseña
      const saltRounds = 10;
      const claveHasheada = await bcrypt.hash(clave, saltRounds);

      const nuevoUsuario = await UsuarioModel.create({
        cedula_usuario,
        clave: claveHasheada,
        rol: rol || 'emprendedor',
        estatus: estatus || 'activo'
      });

      res.status(201).json({ success: true, data: nuevoUsuario });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Actualizar usuario (sin email)
  async update(req, res) {
    try {
      const { rol, estatus } = req.body;
      const usuario = await UsuarioModel.update(req.params.id, { rol, estatus });
      if (!usuario) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }
      res.json({ success: true, data: usuario });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Cambiar contraseña
  async updatePassword(req, res) {
    try {
      const { nuevaClave } = req.body;
      const saltRounds = 10;
      const claveHasheada = await bcrypt.hash(nuevaClave, saltRounds);
      
      const usuario = await UsuarioModel.updatePassword(req.params.id, claveHasheada);
      if (!usuario) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }
      res.json({ success: true, message: 'Contraseña actualizada correctamente' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Eliminar usuario
  async delete(req, res) {
    try {
      const usuario = await UsuarioModel.delete(req.params.id);
      if (!usuario) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }
      res.json({ success: true, message: 'Usuario eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Cambiar estatus
  async cambiarEstatus(req, res) {
    try {
      const { estatus } = req.body;
      const usuario = await UsuarioModel.cambiarEstatus(req.params.id, estatus);
      if (!usuario) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }
      const { clave, ...usuarioSinClave } = usuario;
      res.json({ success: true, data: usuarioSinClave });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Login (usando cédula en lugar de email)
  async login(req, res) {
    try {
      console.log('🔐 [LOGIN] Petición recibida');
      console.log('📦 Body:', req.body);
      
      const { cedula_usuario, clave } = req.body;
      
      // Validar que los campos no estén vacíos
      if (!cedula_usuario || !clave) {
        console.log('❌ [LOGIN] Campos vacíos');
        return res.status(400).json({ 
          success: false, 
          error: 'Cédula y contraseña son requeridos' 
        });
      }
      
      console.log('🔍 [LOGIN] Buscando usuario con cédula:', cedula_usuario);
      
      // Buscar por cédula
      const usuario = await UsuarioModel.getByCedula(cedula_usuario);
      
      if (!usuario) {
        console.log('❌ [LOGIN] Usuario no encontrado');
        return res.status(401).json({ 
          success: false, 
          error: 'Credenciales incorrectas' 
        });
      }
      
      console.log('✅ [LOGIN] Usuario encontrado:', {
        id: usuario.id,
        cedula: usuario.cedula_usuario,
        rol: usuario.rol,
        estatus: usuario.estatus
      });

      // Verificar estatus
      if (usuario.estatus !== 'activo') {
        console.log('❌ [LOGIN] Usuario inactivo:', usuario.estatus);
        return res.status(401).json({ 
          success: false, 
          error: 'Usuario inactivo' 
        });
      }

      // Verificar contraseña
      console.log('🔑 [LOGIN] Verificando contraseña...');
      console.log('  - Contraseña ingresada (longitud):', clave.length);
      console.log('  - Hash almacenado:', usuario.clave ? usuario.clave.substring(0, 20) + '...' : 'NO EXISTE');
      
      const claveValida = await bcrypt.compare(clave, usuario.clave);
      
      console.log('  - ¿Contraseña válida?:', claveValida);
      
      if (!claveValida) {
        console.log('❌ [LOGIN] Contraseña incorrecta');
        return res.status(401).json({ 
          success: false, 
          error: 'Credenciales incorrectas' 
        });
      }

      // Actualizar último acceso
      console.log('📝 [LOGIN] Actualizando último acceso');
      await UsuarioModel.updateUltimoAcceso(cedula_usuario);

      const { clave: _, ...usuarioSinClave } = usuario;
      
      console.log('✅ [LOGIN] Login exitoso para:', usuarioSinClave.cedula_usuario);
      
      res.json({ 
        success: true, 
        data: usuarioSinClave 
      });
      
    } catch (error) {
      console.error('💥 [LOGIN] Error:', error);
      console.error('  - Mensaje:', error.message);
      console.error('  - Stack:', error.stack);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor: ' + error.message 
      });
    }
  }
};

module.exports = usuarioController;