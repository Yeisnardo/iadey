const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Rutas existentes
router.get('/', usuarioController.getAll);
router.get('/:id', usuarioController.getById);
router.get('/cedula/:cedula_usuario', usuarioController.getByCedula); // Nueva ruta por cédula
router.post('/', usuarioController.create);
router.put('/:id', usuarioController.update);
router.put('/:id/password', usuarioController.updatePassword);
router.put('/:id/estatus', usuarioController.cambiarEstatus);
router.delete('/:id', usuarioController.delete);
router.post('/login', usuarioController.login);

module.exports = router;