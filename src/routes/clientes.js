const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const { isAuthCliente } = require('../middlewares/auth');

router.get('/perfil', isAuthCliente, clientesController.getMiPerfil);
router.put('/perfil', isAuthCliente, clientesController.updateMiPerfil);
router.post('/cambiar-password', isAuthCliente, clientesController.cambiarPassword);

module.exports = router;