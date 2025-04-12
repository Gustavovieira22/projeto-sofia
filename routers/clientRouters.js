const express = require('express');
const clientController = require('../controllers/clientController');

const router = express.Router();

//Rotas PUT//
router.put('/api/editar/cliente',clientController.edit_dataClient);
//Rotas POST//

//Rotas DELETE//
router.delete('/clientes/delete/:phone',clientController.deleteClient);

//Rotas GET//
router.get('/',clientController.display);
router.get('/editar/cliente',clientController.editClient);
router.get('/api/clientes',clientController.allClients);
router.get('/api/status',clientController.controlClient);
router.get('/api/service/:phone/:service',clientController.changeService);
router.get('/api/contador-clientes',clientController.countClients);
router.get('/api/buscar/cliente/:searchField',clientController.searchClient);

module.exports = router;