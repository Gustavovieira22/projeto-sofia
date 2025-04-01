const mongoose = require('mongoose');

// Definindo o schema da Collection para o cliente//
const clientSchema = new mongoose.Schema({
    name:{type: String},
    phone: {type: String, required: true, unique: true},
    address:{
        address_write: {type: String},
        location:{
            lat:{type:Number},
            long:{type:Number}
        }
    },
    date_contact:{type: Date, default: Date.now},
    notes:[{type:String, default:[]}]
});

//Criando modelo baseado no schema
const Client = mongoose.model('Client',clientSchema);

module.exports = Client;