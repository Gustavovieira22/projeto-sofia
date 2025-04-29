const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();

//Arquivo de conexão com o banco de dados//
const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.ACCESS_MONGO);
        console.log(`Conectado ao MongoDB`);
    } catch (error) {
        console.log(`Erro ao conectar ao MongoDB: `,error);
        process.exit(1);
    }
};

module.exports = connectDB;