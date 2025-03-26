const mongoose = require('mongoose');
/*colletion para o cardápio*/

// Definindo schema da Collection para o item do cardápio:
const itemSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String
    },
    price:{
        type: Number,
        required: true
    }
});

//Definindo schema da collection para a categoria que contém os itens
const categoriaSchema = new mongoose.Schema({
    category:{
        type: String, 
        required: true
    },
    item:[itemSchema] //array com informações dos itens//
});

//Criando modelo baseado no schema
const Menu = mongoose.model('Menu',categoriaSchema);

module.exports = Menu;