// controllers/usuarioController.js
const UsuarioModel = require('../models/UsuarioModel');
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

  // Obtener usuario por cédula
  async getByCedula(req, res) {
    try {
      const usuario = await UsuarioModel.getByCedula(req.params.cedula_usuario);
      if (!usuario) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }
      // No enviar la contraseña en la respuesta
      const { clave, ...usuarioSinClave } = usuario;
      res.json({ success: true, data: usuarioSinClave });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

// Crear usuario
async create(req, res) {
  try {
    const { cedula_usuario, clave, id_rol_usu, estatus } = req.body;

    // Validar que id_rol_usu sea un número válido
    if (!id_rol_usu || isNaN(parseInt(id_rol_usu))) {
      return res.status(400).json({ 
        success: false, 
        error: 'El rol del usuario es requerido y debe ser un ID válido' 
      });
    }

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
      id_rol_usu: parseInt(id_rol_usu), // Convertir a número
      estatus: estatus || 'activo'
    });

    res.status(201).json({ success: true, data: nuevoUsuario });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
},

// Actualizar usuario
async update(req, res) {
  try {
    const { id_rol_usu, estatus } = req.body;
    
    // Validar que id_rol_usu sea un número válido si se proporciona
    if (id_rol_usu && isNaN(parseInt(id_rol_usu))) {
      return res.status(400).json({ 
        success: false, 
        error: 'El rol del usuario debe ser un ID válido' 
      });
    }

    const usuarioActualizado = await UsuarioModel.update(req.params.id, { 
      id_rol_usu: id_rol_usu ? parseInt(id_rol_usu) : undefined, 
      estatus 
    });
    
    if (!usuarioActualizado) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }
    res.json({ success: true, data: usuarioActualizado });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
},

// Nuevo método: Obtener roles disponibles
async getRoles(req, res) {
  try {
    const roles = await UsuarioModel.getRoles();
    res.json({ success: true, data: roles });
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

  

  // Login
// controllers/usuarioController.js - Método login CORREGIDO

async login(req, res) {
    try {
      const { cedula_usuario, clave } = req.body;
      
      if (!cedula_usuario || !clave) {
        return res.status(400).json({ 
          success: false, 
          error: 'Cédula y contraseña son requeridos' 
        });
      }
      
      const usuario = await UsuarioModel.getByCedula(cedula_usuario);
      
      if (!usuario) {
        return res.status(401).json({ 
          success: false, 
          error: 'Credenciales incorrectas' 
        });
      }

      if (usuario.estatus !== 'activo') {
        return res.status(403).json({ 
          success: false, 
          error: 'Usuario inactivo. Contacte al administrador.' 
        });
      }

      const claveValida = await bcrypt.compare(clave, usuario.clave);
      
      if (!claveValida) {
        return res.status(401).json({ 
          success: false, 
          error: 'Credenciales incorrectas' 
        });
      }

      await UsuarioModel.updateUltimoAcceso(cedula_usuario);

      // Eliminar clave de la respuesta
      const { clave: _, ...usuarioSinClave } = usuario;
      
      // IMPORTANTE: Asegurar que todos los datos necesarios estén presentes
      const usuarioRespuesta = {
        ...usuarioSinClave,
        id_rol_usu: usuario.id_rol_usu,
        rol: usuario.nombre_rol || usuario.rol,
        nombre_rol: usuario.nombre_rol || usuario.rol
      };
      
      // Respuesta SIN token (solo datos del usuario)
      res.json({ 
        success: true, 
        data: usuarioRespuesta
      });
      
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
      });
    }
  }
};

module.exports = usuarioController;