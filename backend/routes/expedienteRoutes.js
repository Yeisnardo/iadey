const express = require('express');
const router = express.Router();
const expedienteController = require('../controllers/expedienteController');

// Rutas principales
router.get('/', expedienteController.getAll);
router.get('/:id', expedienteController.getById);
router.get('/codigo/:codigo', expedienteController.getByCodigo);
router.get('/usuario/:id_usuario', expedienteController.getByUsuario);
router.get('/estatus/:estatus', expedienteController.getByEstatus);
router.post('/', expedienteController.create);
router.put('/:id', expedienteController.update);
router.patch('/:id/estatus', expedienteController.updateStatus);
router.delete('/:id', expedienteController.delete);

module.exports = router;