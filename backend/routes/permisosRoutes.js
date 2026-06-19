// routes/permisos.js - Actualizado

const express = require('express');
const router = express.Router();
const permisosController = require('../controllers/permisosController');

// Rutas de permisos
router.get('/', permisosController.getAllPermisos);
router.get('/rol/:idRol', permisosController.getPermisosByRol);
router.post('/rol/:idRol', permisosController.asignarPermisosRol);
router.get('/usuario/:idUsuario', permisosController.getPermisosByUsuario);
router.get('/verificar/:idUsuario/:menuItemId/:accion', permisosController.verificarPermiso);

// Rutas de roles
router.get('/roles', permisosController.getRoles);
router.post('/roles', permisosController.createRol);
router.put('/roles/:id', permisosController.updateRol);
router.delete('/roles/:id', permisosController.deleteRol);

module.exports = router;