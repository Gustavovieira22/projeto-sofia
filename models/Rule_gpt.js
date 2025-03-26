const mongoose = require('mongoose');

// Definindo o schema da Collection para as regras do gpt
const ruleSchema = new mongoose.Schema({
    role:{type: String, enum: ['system', 'user', 'assistant'], required: true},
    content: {type: String, required: true}
});

//Criando modelo baseado no schema
const Rule = mongoose.model('Rule',ruleSchema);

module.exports = Rule;