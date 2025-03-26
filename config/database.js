const mongoose = require('mongoose');
//Estabelece a conexão com o banco de dados;

const connectDB = async()=>{
    try {
        await mongoose.connect(`mongodb://localhost:27017/projeto_sofia`);
        console.log(`Conectado ao MongoDB`);
    } catch (error) {
        console.log(`Erro ao conectar ao MongoDB: `,error);
        process.exit(1);
    }
};

module.exports = connectDB;