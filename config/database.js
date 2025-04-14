const mongoose = require('mongoose');
const dotenv = require("dotenv");
dotenv.config();
//Arquivo de conexão com o banco de dados//

const connectDB = async()=>{
    try {
        await mongoose.connect(`mongodb+srv://${process.env.LOGIN_MONGO}:${process.env.PASS_MONGO}@cluster0.shvuvws.mongodb.net/projeto_sofia?retryWrites=true&w=majority&appName=Cluster0`);
        
        // await mongoose.connect(`mongodb://localhost:27017/projeto_sofia`);

        console.log(`Conectado ao MongoDB`);
    } catch (error) {
        console.log(`Erro ao conectar ao MongoDB: `,error);
        process.exit(1);
    }
};

module.exports = connectDB;