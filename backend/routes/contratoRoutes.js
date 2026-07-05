const express = require('express');
const router = express.Router();
const contratoController = require('../controllers/contratoController');

// Rutas generales
router.get('/', contratoController.getAll);
router.post('/', contratoController.create);
router.get('/:id', contratoController.getById);
router.get('/cedula/:cedula', contratoController.getByCedula);
router.put('/:id/estatus', contratoController.updateStatus);
router.get('/last-number', contratoController.getLastContractNumber);

module.exports = router;