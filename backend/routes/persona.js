const express = require('express');
const router = express.Router();
const personaController = require('../controllers/personaController');

// Crear persona completa
router.post('/', personaController.createPersona);

// Crear persona básica
router.post('/basica', personaController.createPersonaBasica);

// Obtener todas las personas
router.get('/', personaController.getPersonas);

// Obtener persona por cédula
router.get('/:cedula', personaController.getPersona);

// Actualizar persona
router.put('/:cedula', personaController.updatePersona);

// Eliminar persona
router.delete('/:cedula', personaController.deletePersona);

module.exports = router;