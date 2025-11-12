const express = require('express');
const router = express.Router();
const favoritosController = require('../controllers/favoritosController');
const { isAuthCliente } = require('../middlewares/auth');

router.get('/', isAuthCliente, favoritosController.getMisFavoritos);
router.post('/', isAuthCliente, favoritosController.addFavorito);
router.delete('/:id', isAuthCliente, favoritosController.removeFavorito);

module.exports = router;