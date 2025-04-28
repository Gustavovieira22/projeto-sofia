const mongoose = require('mongoose');

// Definindo o schema da Collection para lista de pedidos//
const orderSchema = new mongoose.Schema({
    phone: {type: String, required:true},
    name: {type: String},
    type: {type: String, enum: ['entrega', 'retirada'], required: true},
    itens: [{
        name:{type: String},
        quantity:{type: Number},
        price:{type: Number}
    }],
    description: {type: String},
    address_write: {type: String},
    location:{type:String},
    date: { type: Date, required: true },
    hour: { type: String, required: true },
    total: { type: Number, required: true },
    payment: {type: String, required: true},
    number: { type: String, required: true}
});

//Criando modelo baseado no schema
const Order = mongoose.model('Order',orderSchema);

module.exports = Order;