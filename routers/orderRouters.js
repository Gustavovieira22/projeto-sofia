const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

//Rotas PUT//

//Rotas POST//

//Rotas DELETE//

//Rotas GET//
router.get('/api/pedidos/:phone',orderController.allOrder);
router.get('/cliente/pedidos',orderController.displayOrder);

module.exports = router;