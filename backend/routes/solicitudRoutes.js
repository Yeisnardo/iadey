// routes/solicitud.js
const express = require('express');
const router = express.Router();
const solicitudController = require('../controllers/solicitudController');

// Rutas de solicitudes
router.get('/aprobadas', solicitudController.getAprobadas);
router.get('/', solicitudController.getAll);
router.get('/emprendedores', solicitudController.getEmprendedores);
router.get('/:id', solicitudController.getById);
router.get('/cedula/:cedula', solicitudController.getByCedula);
router.post('/', solicitudController.create);
router.put('/:id', solicitudController.update);
router.put('/:id/estatus', solicitudController.updateEstatus);
router.delete('/:id', solicitudController.delete);

module.exports = router;