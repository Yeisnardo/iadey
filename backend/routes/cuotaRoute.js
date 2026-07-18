const express = require('express');
const router = express.Router();
const cuotaController = require('../controllers/cuotaController');

// Rutas generales
router.get('/', cuotaController.getAll);
router.get('/cedula/:id_cedula_aprob', cuotaController.getByCedulaAprob);
router.get('/contrato/:id_contrato/cuotas', cuotaController.getCuotasByContrato);
router.post('/cuota/:id_cuota/pagar', cuotaController.registrarPago);
router.post('/contrato/:id_contrato/generar-cuotas-manual', cuotaController.generarCuotasManual);
router.post('/actualizar-mora', cuotaController.actualizarMora);

// Ruta de prueba para recalcular gracias
router.post('/test-recalculo/:id_contrato', cuotaController.testRecalculo);

module.exports = router;