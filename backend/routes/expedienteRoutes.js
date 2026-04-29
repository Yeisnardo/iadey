const express = require('express');
const router = express.Router();
const expedienteController = require('../controllers/expedienteController');

// Rutas principales
router.get('/aprobadas', expedienteController.getSolAprobadasExp);
router.post('/', expedienteController.create);

module.exports = router;