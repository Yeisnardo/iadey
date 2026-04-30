// backend/routes/inspeccionRoutes.js
const express = require('express');
const router = express.Router();
const inspeccionController = require('../controllers/inspeccionController');

// Rutas de consulta (GET)
router.get('/', inspeccionController.getAll);
router.get('/:id', inspeccionController.getById);
router.get('/expediente/:id_expediente', inspeccionController.getByExpediente);
router.get('/emprendimiento/:id_expediente', inspeccionController.getEmprendimientoData);

// Rutas de escritura (POST/PUT)
router.post('/', inspeccionController.create);
router.put('/:id', inspeccionController.update);
router.post('/:id/resultados', inspeccionController.saveInspectionResults);

module.exports = router;