const express = require('express');
const router = express.Router();
const aprobacionController = require('../controllers/aprobacionController');

// Rutas para aprobaciones
router.get('/', aprobacionController.getAll);
router.get('/stats', aprobacionController.getStats);
router.get('/:id', aprobacionController.getById);
router.post('/verificar-requisitos', aprobacionController.verificarRequisitos);

module.exports = router;