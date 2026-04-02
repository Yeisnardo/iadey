const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');

// Crear un nuevo usuario
router.post('/', usuariosController.createUsuario);

// Obtener todos los usuarios
router.get('/', usuariosController.getUsuarios);

// Obtener un usuario por cédula
router.get('/:cedula_usuario', usuariosController.getUsuario);

// Actualizar un usuario
router.put('/:cedula_usuario', usuariosController.updateUsuario);

// Eliminar un usuario
router.delete('/:cedula_usuario', usuariosController.deleteUsuario);

// Actualizar estatus del usuario
router.put('/:cedula_usuario/estatus', usuariosController.updateUsuarioEstatus);

// Verificar contraseña
router.post('/verify-password', usuariosController.verifyPassword);

// Actualizar contraseña
router.put('/:cedula_usuario/password', usuariosController.updatePassword);

// Logout
router.post('/logout', usuariosController.logoutUsuario);

module.exports = router;