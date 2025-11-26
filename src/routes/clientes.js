const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const { isAuthCliente, isAuthAdmin } = require('../middlewares/auth');
const uploadPerfil = require('../middlewares/uploadPerfil');
const { body } = require('express-validator');

router.get('/perfil', isAuthCliente, clientesController.getMiPerfil);
router.put('/perfil', 
    isAuthCliente, 
    uploadPerfil, 
    [
        body('email')
            .trim()
            .isEmail().withMessage('El formato del correo electrónico no es válido.')
            .normalizeEmail(), 

        body('nombre')
            .trim()
            .notEmpty().withMessage('El nombre es obligatorio.')
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras.'),

        body('apellido')
            .trim()
            .notEmpty().withMessage('El apellido es obligatorio.')
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El apellido solo puede contener letras.'),

        body('telefono')
            .optional({ checkFalsy: true })
            .trim()
            .isNumeric().withMessage('El teléfono solo debe contener números.')
            .isLength({ min: 10, max: 10 }).withMessage('El teléfono debe tener exactamente 10 dígitos.')
    ],
    clientesController.updateMiPerfil
);router.post('/cambiar-password', isAuthCliente, clientesController.cambiarPassword);
router.post('/fondos', isAuthCliente, clientesController.agregarFondos);
router.get('/admin/todos', isAuthAdmin, clientesController.getAllClientes);
router.get('/admin/:id', isAuthAdmin, clientesController.getClienteById);
router.post('/admin/crear', isAuthAdmin, clientesController.createClienteByAdmin);
router.put('/admin/:id', isAuthAdmin, clientesController.updateClienteByAdmin);

module.exports = router;