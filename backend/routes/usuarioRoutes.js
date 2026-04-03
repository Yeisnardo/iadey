const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Rutas públicas
router.post('/login', usuarioController.login);

// Rutas principales
router.get('/usuarios', usuarioController.getAll);
router.get('/usuarios/:id', usuarioController.getById);
router.get('/usuarios/email/:email', usuarioController.getByEmail);
router.post('/usuarios', usuarioController.create);
router.put('/usuarios/:id', usuarioController.update);
router.delete('/usuarios/:id', usuarioController.delete);
router.put('/usuarios/:id/password', usuarioController.updatePassword);
router.put('/usuarios/:id/estatus', usuarioController.cambiarEstatus);

module.exports = router;