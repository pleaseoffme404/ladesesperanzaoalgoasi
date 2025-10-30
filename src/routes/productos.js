const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const { isAuthAdmin } = require('../middlewares/auth');

router.get('/', productosController.getAllProductos);
router.get('/:id', productosController.getProductoById);

router.post('/', isAuthAdmin, productosController.createProducto);
router.put('/:id', isAuthAdmin, productosController.updateProducto);
router.delete('/:id', isAuthAdmin, productosController.deleteProducto);

module.exports = router;