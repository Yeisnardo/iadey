const express = require('express');
const router = express.Router();
const contratoController = require('../controllers/contratoController');

// Rutas para contrato
router.get('/', contratoController.getAll);
router.post('/', contratoController.create);
router.get('/last-number', contratoController.getLastContractNumber);
router.get('/:id', contratoController.getById);
router.put('/:id/estatus', contratoController.updateStatus);
router.post('/:id/desembolso', contratoController.realizarDesembolso);
router.get('/:id/desembolsos', contratoController.getDesembolsosByContrato);

// Ruta para confirmar pago de desembolso
router.put('/desembolso/:id/confirmar-pago', contratoController.confirmarPago);

module.exports = router;