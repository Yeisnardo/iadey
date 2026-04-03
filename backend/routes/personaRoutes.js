const express = require('express');
const router = express.Router();
const personaController = require('../controllers/personaController');

// Rutas principales
router.get('/personas', personaController.getAll);
router.get('/personas/tipo/:tipo', personaController.getByTipo);
router.get('/personas/:id', personaController.getById);
router.get('/personas/cedula/:cedula', personaController.getByCedula);
router.post('/personas', personaController.create);
router.put('/personas/:id', personaController.update);
router.delete('/personas/:id', personaController.delete);

module.exports = router;