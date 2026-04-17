const express = require('express');
const router = express.Router();
const solicitudController = require('../controllers/solicitudController');

// Rutas para solicitudes
router.get('/', solicitudController.getAll);
router.get('/:id', solicitudController.getById);
router.get('/cedula/:cedula_persona', solicitudController.getByCedula);
router.post('/', solicitudController.create);
router.put('/:id', solicitudController.update);
router.put('/:id/estatus', solicitudController.cambiarEstatus);
router.delete('/:id', solicitudController.delete);

module.exports = router;