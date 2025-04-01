const mongoose = require('mongoose');

// Definindo o schema da Collection para as regras do gpt
const deliverySchema = new mongoose.Schema({
    role:{type: String, enum: ['system', 'user', 'assistant'], required: true},
    content: {type: String, required: true}
});

//Criando modelo baseado no schema
const Delivery_locations = mongoose.model('Delivery_locations',deliverySchema);

module.exports = Delivery_locations;