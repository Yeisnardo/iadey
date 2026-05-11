// routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Login (debe ir antes de las rutas con parámetros)
router.post('/login', usuarioController.login);

// Rutas CRUD
router.get('/', usuarioController.getAll);
router.get('/cedula/:cedula_usuario', usuarioController.getByCedula);
router.get('/:id', usuarioController.getById);
router.post('/', usuarioController.create);
router.put('/:id', usuarioController.update);
router.put('/:id/password', usuarioController.updatePassword);
router.put('/:id/estatus', usuarioController.cambiarEstatus);
router.delete('/:id', usuarioController.delete);

module.exports = router;