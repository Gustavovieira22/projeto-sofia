const {initData} = require('./data/dataLoader');//inicializa variáveis com parametros do gpt//
const connectDB = require('./config/database');//arquivo de conexão com o banco de dados//
const client = require('./whatsapp');//modulo de inicialização da api whatsapp//

gptParams();//inicia função que carrega variaveis com parametros para configuração do gpt//
client.initialize();// Inicializa api whatsapp//

//Carrega os parametros do gpt para cache local//
async function gptParams() {
    await connectDB(); // Aguarda a conexão com o banco de dados//
    await initData();  // recupera os dados do banco e guarda em cache local//
};
  